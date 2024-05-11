const {
  DeleteObjectCommand,
  GetObjectCommand,
  S3Client,
  ListBucketsCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  HeadObjectCommand,
} = require("@aws-sdk/client-s3");
const fs = require("fs");
const { s3Client } = require("../aws/clients");
const listObjects = async (Bucket) => {
  const command = new ListObjectsV2Command({
    Bucket,
    Prefix: process.env.S3_BUCKET_FOLDER,
  });
  const response = await s3Client.send(command);
  console.log(response);
  return response;
};
const getObject = async ({ Bucket, Key }) => {
  try {
    const existCommand = new HeadObjectCommand({
      Bucket,
      Key,
    });
    const objectExists = await s3Client.send(existCommand).catch((err) => {
      console.log("Error " + err);
      if (err.name === "NotFound") {
        return false;
      }
    });
    if (!objectExists) return { message: "Object does not exist" };
    const command = new GetObjectCommand({
      Bucket,
      Key: Key,
    });
    const response = await s3Client.send(command);
    return response;
  } catch (error) {
    return error;
  }
};
const getBucketUrl = async (Bucket) => {
  const bucketName = Bucket;
  const s3BucketUrl = `https://${bucketName}.s3.amazonaws.com`;
  return s3BucketUrl;
};
const getObjectUrl = async ({ Bucket, Key }) => {
  const bucketName = Bucket;
  const s3ObjectUrl = `https://${bucketName}.s3.amazonaws.com/${Key}`;
  return s3ObjectUrl;
};
const putObject = async ({ Bucket, Key, image, ContentType }) => {
  const command = new PutObjectCommand({
    Bucket,
    Key,
    Body: image,
    ContentType,
  });
  const response = await s3Client.send(command);
  const url = await getObjectUrl({ Bucket: process.env.S3_BUCKET_NAME, Key });
  return { Key, url };
};
const deleteObject = async ({ Bucket, Key }) => {
  try {
    const existCommand = new HeadObjectCommand({
      Bucket,
      Key,
    });
    const objectExists = await s3Client.send(existCommand).catch((err) => {
      if (err.name === "NotFound") {
        return false;
      }
    });
    if (!objectExists) return { message: "Object does not exist" };
    const command = new DeleteObjectCommand({
      Bucket,
      Key,
    });
    const response = await s3Client.send(command);
    return { message: "Object deleted Successfully" };
  } catch (error) {
    return error;
  }
};
module.exports = {
  listObjects,
  putObject,
  deleteObject,
  getObject,
  getBucketUrl,
  getObjectUrl,
};
