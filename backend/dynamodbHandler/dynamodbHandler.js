require("dotenv").config();
const { dynamodbClient, s3Client } = require("./aws/clients");
const { UpdateItemCommand } = require("@aws-sdk/client-dynamodb");
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const util = require("util");
console.log("dynamdbHandler");
const dynamodbHandler = async (event) => {
  console.log(util.inspect(event, false, null, true /* enable colors */));
  console.log(event.dynamodb);
  const userId = unmarshall(event.Records[0].dynamodb.Keys).userId;
  const data = unmarshall(event.Records[0].dynamodb.NewImage);
  console.log(userId);
  console.log(data);
  const urlCount = data.imageUrl.length;
  if (urlCount <= 10) return { message: "no images deleted" };
  const url = data.imageUrl[0];
  const Key = url.split("/")[url.split("/").length - 1];
  console.log(Key);
  const Bucket = process.env.S3_BUCKET_NAME;
  const deleteResponse = await deleteObject({ Bucket, Key });
  console.log(deleteResponse);
  console.log(marshall(userId));
  const command = new UpdateItemCommand({
    TableName: "imageTagger",
    Key: { userId: marshall(userId) },
    UpdateExpression: "REMOVE #imageUrl[0]",
    ExpressionAttributeNames: {
      "#imageUrl": "imageUrl",
      // "#index": "0",
    },
  });
  const dynamodbResponse = await dynamodbClient.send(command);
  console.log(dynamodbResponse);
  return {
    success: true,
    message: "DynamoDB lambda trigger completed successfully",
  };
};
const deleteObject = async ({ Bucket, Key }) => {
  const command = new DeleteObjectCommand({
    Bucket,
    Key,
  });
  const response = await s3Client.send(command);
  return { message: "Object deleted Successfully" };
};
const event = {
  Records: [
    {
      eventID: "ca01df07723385555491fd6f64140fa7",
      eventName: "MODIFY",
      eventVersion: "1.1",
      eventSource: "aws:dynamodb",
      awsRegion: "ap-south-1",
      dynamodb: {
        ApproximateCreationDateTime: 1715692512,
        Keys: {
          userId: { S: "7ab4cdf7-6de9-4107-8baf-6be37b153ef0" },
        },
        NewImage: {
          firstname: { S: "" },
          imageUrl: {
            L: [
              {
                S: "https://yash-image-tagger-resized.s3.amazonaws.com/7ab4cdf7-6de9-4107-8baf-6be37b153ef0_2024-05-11T10:32:14.823Z.jpeg",
              },
              {
                S: "https://yash-image-tagger-resized.s3.amazonaws.com/7ab4cdf7-6de9-4107-8baf-6be37b153ef0_2024-05-13T15:01:13.601Z.jpeg",
              },
              {
                S: "https://yash-image-tagger-resized.s3.amazonaws.com/7ab4cdf7-6de9-4107-8baf-6be37b153ef0_2024-05-13T15:03:42.662Z.jpeg",
              },
              {
                S: "https://yash-image-tagger-resized.s3.amazonaws.com/7ab4cdf7-6de9-4107-8baf-6be37b153ef0_2024-05-13T15:04:53.167Z.jpeg",
              },
              {
                S: "https://yash-image-tagger-resized.s3.amazonaws.com/7ab4cdf7-6de9-4107-8baf-6be37b153ef0_2024-05-13T15:04:55.130Z.jpeg",
              },
              {
                S: "https://yash-image-tagger-resized.s3.amazonaws.com/7ab4cdf7-6de9-4107-8baf-6be37b153ef0_2024-05-13T15:04:56.671Z.jpeg",
              },
              {
                S: "https://yash-image-tagger-resized.s3.amazonaws.com/7ab4cdf7-6de9-4107-8baf-6be37b153ef0_2024-05-13T15:04:57.937Z.jpeg",
              },
              {
                S: "https://yash-image-tagger-resized.s3.amazonaws.com/7ab4cdf7-6de9-4107-8baf-6be37b153ef0_2024-05-13T15:04:59.399Z.jpeg",
              },
              {
                S: "https://yash-image-tagger-resized.s3.amazonaws.com/7ab4cdf7-6de9-4107-8baf-6be37b153ef0_2024-05-13T15:05:00.814Z.jpeg",
              },
              {
                S: "https://yash-image-tagger-resized.s3.amazonaws.com/7ab4cdf7-6de9-4107-8baf-6be37b153ef0_2024-05-13T15:05:02.114Z.jpeg",
              },
              {
                S: "https://yash-image-tagger-resized.s3.amazonaws.com/7ab4cdf7-6de9-4107-8baf-6be37b153ef0_2024-05-13T15:05:48.909Z.jpeg",
              },
              {
                S: "https://yash-image-tagger-resized.s3.amazonaws.com/7ab4cdf7-6de9-4107-8baf-6be37b153ef0_2024-05-13T15:13:03.401Z.jpeg",
              },
            ],
          },
          userId: { S: "7ab4cdf7-6de9-4107-8baf-6be37b153ef0" },
          email: { S: "yashchokhani953@gmail.com" },
          lastname: { S: "" },
          username: { S: "amanjain23" },
        },
        SequenceNumber: "39493000000000032044718242",
        SizeBytes: 1576,
        StreamViewType: "NEW_IMAGE",
      },
      eventSourceARN:
        "arn:aws:dynamodb:ap-south-1:225542105072:table/imageTagger/stream/2024-05-12T13:39:06.055",
    },
  ],
};
dynamodbHandler(event);
module.exports.handler = dynamodbHandler;

// TO DO: dynamodb delete error , stream error still exists, error is coming due to bad data, see the concept of idempotent
