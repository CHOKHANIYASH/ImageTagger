provider "aws" {
  region = "ap-south-1"
}
//lambda role and policy
data "aws_iam_policy_document" "lambda_role_policy" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}
resource "aws_iam_role" "lambda_role" { // lambda role creation
  name               = "lambda_role"
  assume_role_policy = data.aws_iam_policy_document.lambda_role_policy.json
}
//lambda role and policy ends

// Image tagger lambda
data "archive_file" "image_tagger_lambda" { // lambda zip creation
  type        = "zip"
  source_dir  = "server"
  output_path = "imageTagger.zip"
}

resource "aws_lambda_function" "image_tagger_lambda" { // lambda ImageTagger creation
  filename      = "imageTagger.zip"
  function_name = "image_tagger_lambda"
  handler       = "src/app.handler"
  # source_code_hash = base64sha256(filebase64("s3Handler.zip"))
  source_code_hash = filebase64sha256(data.archive_file.image_tagger_lambda.output_path)
  role             = aws_iam_role.lambda_role.arn
  runtime          = "nodejs20.x"
}
//Image tagger lambda ends

// Image resizer lambda
data "archive_file" "lambda_resizer" { // lambda zip creation
  type        = "zip"
  source_dir  = "s3Handler"
  output_path = "s3Handler.zip"
}


resource "aws_lambda_function" "lambda_resizer" { // lambda resizer creation
  filename      = "s3Handler.zip"
  function_name = "image_tagger_resizer"
  handler       = "s3Handler.handler"
  # source_code_hash = base64sha256(filebase64("s3Handler.zip"))
  source_code_hash = filebase64sha256(data.archive_file.lambda_resizer.output_path)
  role             = aws_iam_role.lambda_role.arn
  runtime          = "nodejs20.x"
}
// Image resizer lambda ends

// s3 
resource "aws_lambda_permission" "allow_bucket" {
  statement_id  = "AllowExecutionFromS3Bucket"                     // A unique identifier for this permission statement
  action        = "lambda:InvokeFunction"                          // The action that is being granted (invoke the Lambda function)
  function_name = aws_lambda_function.lambda_resizer.function_name // The ARN of the Lambda function
  principal     = "s3.amazonaws.com"                               // The AWS service that is granted permission (S3)
  source_arn    = aws_s3_bucket.image_tagger_bucket.arn            // The ARN of the S3 bucket
}


resource "aws_s3_bucket" "image_tagger_bucket" { // s3 bucket creation
  bucket = "yash-image-tagger"
}
resource "aws_s3_bucket" "image_tagger_bucket_resized" { // s3 bucket creation
  bucket = "yash-image-tagger-resized"
}
resource "aws_s3_bucket_notification" "bucket_notification" { // s3 bucket notification to lambda
  bucket = aws_s3_bucket.image_tagger_bucket.bucket
  lambda_function {
    lambda_function_arn = aws_lambda_function.lambda_resizer.arn
    events              = ["s3:ObjectCreated:*"]
  }
  depends_on = [aws_lambda_permission.allow_bucket]
}
//s3 ends

// CloudWatch Logs 
resource "aws_cloudwatch_log_group" "lambda_log_group" { // CloudWatch log group creation for image resizer lambda
  name              = "/aws/lambda/${aws_lambda_function.lambda_resizer.function_name}"
  retention_in_days = 14
}
resource "aws_cloudwatch_log_group" "lambda_log_group_image_tagger" { // CloudWatch log group creation for image resizer lambda
  name              = "/aws/lambda/${aws_lambda_function.image_tagger_lambda.function_name}"
  retention_in_days = 14
}
data "aws_iam_policy_document" "lambda_logs_policy" { // IAM policy for lambda to write logs to CloudWatch data
  statement {
    effect = "Allow"
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]
    resources = ["arn:aws:logs:*:*:*"]
  }
}

resource "aws_iam_policy" "lambda_logs_policy" { // IAM policy for lambda to write logs to CloudWatch
  name        = "lambda_logs_policy"
  description = "IAM policy for lambda to write logs to CloudWatch"
  policy      = data.aws_iam_policy_document.lambda_logs_policy.json
}

resource "aws_iam_role_policy_attachment" "lambda_logs" { // IAM role policy attachment for lambda to write logs to CloudWatch
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.lambda_logs_policy.arn
}
// End of CloudWatch Logs

// API Gateway
resource "aws_api_gateway_rest_api" "image_tagger_api" { // API Gateway creation
  name = "image_tagger_api"
}
resource "aws_api_gateway_resource" "image_tagger_resource" { // API Gateway resource creation
  rest_api_id = aws_api_gateway_rest_api.image_tagger_api.id
  parent_id   = aws_api_gateway_rest_api.image_tagger_api.root_resource_id
  path_part   = "{proxy+}"
}

resource "aws_api_gateway_method" "image_tagger_method" { // API Gateway method creation
  rest_api_id   = aws_api_gateway_rest_api.image_tagger_api.id
  resource_id   = aws_api_gateway_resource.image_tagger_resource.id
  http_method   = "ANY"
  authorization = "NONE"
  request_parameters = {
    "method.request.path.proxy" = true
  }
}

resource "aws_api_gateway_integration" "lambda_integration" { // API Gateway integration with lambda
  rest_api_id             = aws_api_gateway_rest_api.image_tagger_api.id
  resource_id             = aws_api_gateway_resource.image_tagger_resource.id
  http_method             = aws_api_gateway_method.image_tagger_method.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.image_tagger_lambda.invoke_arn
  content_handling        = "CONVERT_TO_TEXT" # Add this line

}

resource "aws_lambda_permission" "apigw_lambda_invoke" { // API Gateway permission to invoke lambda function
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.image_tagger_lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.image_tagger_api.execution_arn}/*/*/*" //The /*/* wildcard indicates that the permission applies to any stage and any HTTP method within that API Gateway.
}

resource "aws_api_gateway_deployment" "image_tagger_deployment" { // API Gateway deployment
  depends_on  = [aws_api_gateway_integration.lambda_integration]
  rest_api_id = aws_api_gateway_rest_api.image_tagger_api.id
  stage_name  = "prod"
  triggers = {
    redeployment = sha1(jsonencode([aws_api_gateway_resource.image_tagger_resource, aws_api_gateway_integration.lambda_integration]))
  }
  lifecycle {
    create_before_destroy = true
  }
}
output "api_url" { // API Gateway URL output
  value = aws_api_gateway_deployment.image_tagger_deployment.invoke_url
}
output "api_execution_arn" { // API Gateway execution ARN output
  value = aws_api_gateway_rest_api.image_tagger_api.execution_arn
}
// API Gateway ends

// DynamoDB
resource "aws_dynamodb_table" "image_tagger_table" {
  name           = "ImageTagger"
  billing_mode   = "PROVISIONED"
  read_capacity  = 2
  write_capacity = 2
  hash_key       = "userId"

  attribute {
    name = "userId"
    type = "S"
  }
  # attribute {
  #   name = "firstName"
  #   type = "S"
  # }
  # attribute {
  #   name = "lastName"
  #   type = "S"
  # }
  # attribute {
  #   name = "username"
  #   type = "S"
  # }
  # attribute {
  #   name = "email"
  #   type = "S"
  # }
  # attribute {
  #   name = "history"
  #   type = "S"
  # }
}
// DynamoDB ends
