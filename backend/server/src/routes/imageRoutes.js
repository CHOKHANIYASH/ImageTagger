const router = require("express").Router();
const { upload } = require("../middleware/middlewares");
const { detectLabels } = require("../controllers/rekognitionControllers");
router.get("/", (req, res) => {
  res.send("Welcome");
});
router.post("/detectlabels", upload.array("image"), async (req, res) => {
  try {
    const image = req.files[0];
    const imageBuffer = image.buffer;
    const response = await detectLabels({ image: imageBuffer });
    res.status(200).send(response);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ success: false, message: "Internal Server Error", data: {} });
  }
});
module.exports = router;
