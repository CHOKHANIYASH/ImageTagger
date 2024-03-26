const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  CognitoIdentityProviderClient,
} = require("@aws-sdk/client-cognito-identity-provider");
const { S3Client } = require("@aws-sdk/client-s3");
// const { SESClient } = require("@aws-sdk/client-ses");
const { RekognitionClient } = require("@aws-sdk/client-rekognition");

const rekognitionClient = new RekognitionClient({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.MY_APP_AWS_ACCESS_KEY,
    secretAccessKey: process.env.MY_APP_AWS_SECRET_ACCESS_KEY,
  },
});
const dynamodbClient = new DynamoDBClient({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.MY_APP_AWS_ACCESS_KEY,
    secretAccessKey: process.env.MY_APP_AWS_SECRET_ACCESS_KEY,
  },
});
const cognitoClient = new CognitoIdentityProviderClient({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.MY_APP_AWS_ACCESS_KEY,
    secretAccessKey: process.env.MY_APP_AWS_SECRET_ACCESS_KEY,
  },
});
const s3Client = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.MY_APP_AWS_ACCESS_KEY,
    secretAccessKey: process.env.MY_APP_AWS_SECRET_ACCESS_KEY,
  },
});

module.exports = { dynamodbClient, cognitoClient, s3Client, rekognitionClient };
