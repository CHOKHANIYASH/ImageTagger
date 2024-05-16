provider "aws" {
  region = "ap-south-1"
}
//lambda role and policy
data "aws_iam_policy_document" "lambda_role_policy" { // lambda role policy creation
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}
resource "aws_iam_role" "lambda_role" { // lambda role creation (common role for all lambdas)
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
data "archive_file" "resizer_lambda" { // lambda zip creation
  type        = "zip"
  source_dir  = "s3Handler"
  output_path = "s3Handler.zip"
}

resource "aws_lambda_function" "resizer_lambda" { // lambda resizer creation
  filename      = "s3Handler.zip"
  function_name = "image_tagger_resizer"
  handler       = "s3Handler.handler"
  # source_code_hash = base64sha256(filebase64("s3Handler.zip"))
  source_code_hash = filebase64sha256(data.archive_file.resizer_lambda.output_path)
  role             = aws_iam_role.lambda_role.arn
  runtime          = "nodejs20.x"
}
// Image resizer lambda ends

// DB lambda
resource "aws_iam_role" "dynamodb_stream_role" {
  name = "dynamodb_stream_role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Principal = {
          Service = "lambda.amazonaws.com"
        },
        Action = "sts:AssumeRole"
      }
    ]
  })
}
resource "aws_iam_policy" "dynamodb_stream_policy" {
  name = "dynamodb_stream_policy"
  description = "IAM policy for lambda to read from DynamoDB stream"
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "dynamodb:GetRecords",
          "dynamodb:GetShardIterator",
          "dynamodb:DescribeStream",
          "dynamodb:ListStreams"
        ],
        Resource = "*"
      }
    ]
  })
}
resource "aws_iam_role_policy_attachment" "dynamodb_stream" {
  role = aws_iam_role.dynamodb_stream_role.name
  policy_arn = aws_iam_policy.dynamodb_stream_policy.arn
}

data "archive_file" "db_lambda" { // lambda zip creation
  type        = "zip"
  source_dir  = "dynamodbHandler"
  output_path = "dynamodbHandler.zip"
}

resource "aws_lambda_function" "db_lambda" { // db lambda creation
  filename      = "dynamodbHandler.zip"
  function_name = "db_lambda"
  handler       = "dynamodbHandler.handler"
  # source_code_hash = base64sha256(filebase64("s3Handler.zip"))
  source_code_hash = filebase64sha256(data.archive_file.db_lambda.output_path)
  role             = aws_iam_role.dynamodb_stream_role.arn
  # role             = aws_iam_role.dynamodb_stream_role.arn
  runtime          = "nodejs20.x"
}
// DB lambda ends 

// s3 
resource "aws_lambda_permission" "allow_bucket" {
  statement_id  = "AllowExecutionFromS3Bucket"                     // A unique identifier for this permission statement
  action        = "lambda:InvokeFunction"                          // The action that is being granted (invoke the Lambda function)
  function_name = aws_lambda_function.resizer_lambda.function_name // The ARN of the Lambda function
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
    lambda_function_arn = aws_lambda_function.resizer_lambda.arn
    events              = ["s3:ObjectCreated:*"]
  }
  depends_on = [aws_lambda_permission.allow_bucket]
}
resource "aws_s3_bucket_public_access_block" "image_tagger_bucket_resized_puclic_access" {
  bucket = aws_s3_bucket.image_tagger_bucket_resized.bucket
}
resource "aws_s3_bucket_policy" "image_tagger_bucket_resized_policy" {
  bucket = aws_s3_bucket.image_tagger_bucket_resized.bucket
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.image_tagger_bucket_resized.arn}/*"
      }
    ]
  })
}
//s3 ends

// CloudWatch Logs 
resource "aws_cloudwatch_log_group" "lambda_log_group" { // CloudWatch log group creation for image resizer lambda
  name              = "/aws/lambda/${aws_lambda_function.resizer_lambda.function_name}"
  retention_in_days = 14
}
resource "aws_cloudwatch_log_group" "lambda_log_group_image_tagger" { // CloudWatch log group creation for image resizer lambda
  name              = "/aws/lambda/${aws_lambda_function.image_tagger_lambda.function_name}"
  retention_in_days = 14
}
resource "aws_cloudwatch_log_group" "lambda_log_group_db_lambda" { // CloudWatch log group creation for image resizer lambda
  name              = "/aws/lambda/${aws_lambda_function.db_lambda.function_name}"
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
resource "aws_iam_role_policy_attachment" "lambda_logs2" { // IAM role policy attachment for lambda to write logs to CloudWatch
  role       = aws_iam_role.dynamodb_stream_role.name
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
  name           = "imageTagger"
  billing_mode   = "PROVISIONED"
  read_capacity  = 2
  write_capacity = 2
  hash_key       = "userId"

  attribute {
    name = "userId"
    type = "S"
  }
  stream_enabled = true
  stream_view_type = "NEW_IMAGE"
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

resource "aws_lambda_event_source_mapping" "db_lambda_source_mapping" {
  event_source_arn = aws_dynamodb_table.image_tagger_table.stream_arn // DynamoDB table ARN
  # function_name = aws_lambda_function.db_lambda.function_name // Lambda function name
  function_name = aws_lambda_function.db_lambda.arn
  batch_size = 200  // The maximum number of records in each batch
  starting_position = "LATEST"  // The position in the stream where the AWS Lambda function should start reading
  maximum_retry_attempts = 2  // The maximum number of times to retry when the function returns an error
} 
resource "aws_lambda_permission" "db_lambda_permission" {
  statement_id = "AllowExeecutionFromDynamodb"
  action = "lambda:invokeFunction"
  function_name = aws_lambda_function.db_lambda.function_name
  principal = "dynamodb.amazonaws.com"
  source_arn = aws_dynamodb_table.image_tagger_table.arn
}
