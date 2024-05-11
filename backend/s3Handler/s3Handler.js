require("dotenv").config();
const { s3Client } = require("./aws/clients");
const { getObject, putObject, deleteObject } = require("./s3Controllers");
const sharp = require("sharp");
const resizeHandler = async (event) => {
  const Bucket = event.Records[0].s3.bucket.name;
  const Key = decodeURIComponent(
    event.Records[0].s3.object.key.replace(/\+/g, " ")
  );
  const imageData = await getObject({ Bucket, Key });
  console.log(Bucket, Key);
  console.log(imageData);
  const ContentType = imageData.ContentType;
  if (imageData.message) return console.log("Object does not exist");
  const image = await imageData.Body.transformToByteArray();
  const imageResized = await sharp(image)
    .resize({
      width: 500,
      height: 450,
      fit: "contain",
    })
    .toBuffer();
  const uploadImage = await putObject({
    Bucket: process.env.S3_BUCKET_NAME,
    Key,
    Body: imageResized,
    ContentType,
  });
  const DeleteObject = await deleteObject({ Bucket, Key });
};
module.exports.handler = resizeHandler;
