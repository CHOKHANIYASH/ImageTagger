const { rekognitionClient } = require("../aws/clients");

const { DetectLabelsCommand } = require("@aws-sdk/client-rekognition");
const { AppError } = require("../middleware/middlewares");
const { putObject } = require("./s3Controllers");
const detectLabels = async ({ image }) => {
  // throw new AppError("Invalid image", 400);

  const command = new DetectLabelsCommand({
    Image: { S3Object: { Bucket: process.env.S3_BUCKET_NAME, Name: image } },
    Features: ["GENERAL_LABELS"],
    MaxLabels: 15,
    MinConfidence: 60,
  });
  const response = await rekognitionClient.send(command).catch((error) => {
    throw new AppError(error.message, 400);
  });
  // console.log(response);
  const imageResponse = await response.Labels.map((label) => {
    if (
      label.Name !== "Human" &&
      label.Name !== "Clothing" &&
      label.Name !== "Accessories" &&
      label.Name !== "Person" &&
      label.Name !== "Apparel" &&
      label.Name !== "Face" &&
      label.Name !== "Head" &&
      label.Name !== "Hair" &&
      label.Name !== "Skin" &&
      label.Name !== "Portrait" &&
      label.Name !== "Selfie" &&
      label.Name !== "Photo" &&
      label.Name !== "Photography" &&
      label.Name !== "Image" &&
      label.Name !== "Picture"
    ) {
      return {
        Name: label.Name,
        Confidence: label.Confidence,
        Alias: label.Aliases,
      };
    } else {
      return null;
    }
  }).filter((label) => label !== null);
  return {
    status: 200,
    response: {
      success: "true",
      message: "The Labels of the Image",
      data: imageResponse.slice(0, 10),
    },
  };
};

module.exports = { detectLabels };
