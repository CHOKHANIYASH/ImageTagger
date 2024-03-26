const { rekognitionClient } = require("../aws/clients");

const { DetectLabelsCommand } = require("@aws-sdk/client-rekognition");

const detectLabels = async ({ image }) => {
  try {
    const command = new DetectLabelsCommand({
      Image: { Bytes: image },
      Features: ["GENERAL_LABELS"],
      MaxLabels: 10,
      MinConfidence: 60,
    });
    const response = await rekognitionClient.send(command);
    const imageResponse = await response.Labels.map((label) => {
      return {
        Name: label.Name,
        Confidence: label.Confidence,
        Alias: label.Aliases,
      };
    });
    return imageResponse;
  } catch (error) {
    return error;
  }
};

module.exports = { detectLabels };
