const router = require("express").Router();
const { upload, handleAsyncError } = require("../middleware/middlewares");
const { detectLabels } = require("../controllers/rekognitionControllers");
const s3Controllers = require("../controllers/s3Controllers");
const userControllers = require("../controllers/userControllers");
router.get("/", (req, res) => {
  res.send("Welcome");
});
// router.post("/detectlabels", upload.array("image"), async (req, res) => {
//   try {
//     const image = req.files[0];
//     const imageBuffer = image.buffer;
//     const response = await detectLabels({ image: imageBuffer });
//     res.status(200).send(response);
//   } catch (error) {
//     console.log(error);
//     res
//       .status(500)
//       .send({ success: false, message: "Internal Server Error", data: {} });
//   }
// });
router.get(
  "/labels",
  handleAsyncError(async (req, res) => {
    // throw new Error();
    const image = req.query.image;
    console.log(image);
    const response = await detectLabels({ image });
    res.status(response.status).send(response.response);
  })
);

router.post(
  "/upload/:userId",
  upload.array("images"),
  handleAsyncError(async (req, res) => {
    const userId = req.params.userId;
    if (!req.files)
      res
        .status(400)
        .send({ success: false, message: "Invalid Input", data: {} });
    // console.log(req.files);
    const image = req.files[0];
    const imageBuffer = image.buffer;
    const ContentType = image.mimetype;
    const Key = `${userId}_${new Date().toISOString()}.${
      ContentType.split("/")[1]
    }`;
    console.log(Key);
    const Bucket = process.env.S3_BUCKET_NAME;
    const s3Response = await s3Controllers.putObject({
      image: imageBuffer,
      Key,
      Bucket: "yash-image-tagger",
      ContentType,
    });
    const { url } = s3Response;
    // console.log(key);
    console.log(url);
    const userResponse = await userControllers.addImageUrl({
      userId,
      imageUrl: url,
    });
    res.status(userResponse.status).send(userResponse.response);
    // res.send("giuerbghu3jrg");
  })
);

module.exports = router;
