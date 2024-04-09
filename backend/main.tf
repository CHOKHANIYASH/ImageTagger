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
resource "aws_iam_role" "lambda_role" {
  name               = "lambda_role"
  assume_role_policy = data.aws_iam_policy_document.lambda_role_policy.json
}
//lambda role and policy ends

// Image tagger lambda
data "archive_file" "lambda" {
  type        = "zip"
  source_dir  = "imageTagger"
  output_path = "imageTagger.zip"
}

resource "aws_lambda_function" "image_tagger_lambda" {
  filename      = "src.zip"
  function_name = "image_tagger_lambda"
  handler       = "src.handler"
  # source_code_hash = base64sha256(filebase64("s3Handler.zip"))
  source_code_hash = filebase64sha256(data.archive_file.lambda.output_path)
  role             = aws_iam_role.lambda_role.arn
  runtime          = "nodejs20.x"
}
//Image tagger lambda ends

// Image resizer lambda
data "archive_file" "lambda" {
  type        = "zip"
  source_dir  = "s3Handler"
  output_path = "s3Handler.zip"
}


resource "aws_lambda_function" "lambda_resizer" {
  filename      = "s3Handler.zip"
  function_name = "image_tagger_resizer"
  handler       = "s3Handler.handler"
  # source_code_hash = base64sha256(filebase64("s3Handler.zip"))
  source_code_hash = filebase64sha256(data.archive_file.lambda.output_path)
  role             = aws_iam_role.lambda_role.arn
  runtime          = "nodejs20.x"
}
// Image resizer lambda ends

// s3 
resource "aws_lambda_permission" "allow_bucket" { // s3 lambda invoke permissio`
  statement_id  = "AllowExecutionFromS3Bucket"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambda_resizer.function_name
  principal     = "s3.amazonaws.com"
  source_arn    = aws_s3_bucket.image_tagger_bucket.arn
}

resource "aws_s3_bucket" "image_tagger_bucket" {
  bucket = "yash-image-tagger"
}
resource "aws_s3_bucket" "image_tagger_bucket_resized" {
  bucket = "yash-image-tagger-resized"
}
resource "aws_s3_bucket_notification" "bucket_notification" {
  bucket = aws_s3_bucket.image_tagger_bucket.bucket
  lambda_function {
    lambda_function_arn = aws_lambda_function.lambda_resizer.arn
    events              = ["s3:ObjectCreated:*"]
  }
  depends_on = [aws_lambda_permission.allow_bucket]
}
//s3 ends

// CloudWatch Logs 
resource "aws_cloudwatch_log_group" "lambda_log_group" {
  name              = "/aws/lambda/${aws_lambda_function.lambda_resizer.function_name}"
  retention_in_days = 14
}
data "aws_iam_policy_document" "lambda_logs_policy" {
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

resource "aws_iam_policy" "lambda_logs_policy" {
  name        = "lambda_logs_policy"
  path        = "/"
  description = "IAM policy for lambda to write logs to CloudWatch"
  policy      = data.aws_iam_policy_document.lambda_logs_policy.json
}

resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.lambda_logs_policy.arn
}
// End of CloudWatch Logs
