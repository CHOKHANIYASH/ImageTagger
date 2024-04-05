const { S3Client } = require("@aws-sdk/client-s3");

const s3Client = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.MY_APP_AWS_ACCESS_KEY,
    secretAccessKey: process.env.MY_APP_AWS_SECRET_ACCESS_KEY,
  },
});
console.log(process.env.MY_APP_AWS_ACCESS_KEY)
module.exports = { s3Client };
