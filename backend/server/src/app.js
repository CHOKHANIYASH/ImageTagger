require("dotenv").config();
const app = require("express")();
const cors = require("cors");
const bodyParser = require("body-parser");
const imageRoutes = require("./routes/imageRoutes");
const userRoutes = require("./routes/userRoutes");
const serverless = require("serverless-http");
const { AppError } = require("./middleware/middlewares");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors({ origin: "*" }));

app.get("/", (req, res) => {
  res.send("Welcome to the image upload API!");
});
app.use("/users", userRoutes);
app.use("/images", imageRoutes);

const PORT = process.env.PORT || 5000;

app.use((err, req, res, next) => {
  console.log(err);
  if (err.name === "AppError") {
    res
      .status(err.status)
      .send({ success: false, message: err.message, data: {} });
    return;
  }
  res.status(err.status || 500).send({
    success: false,
    message: "Internal Server Error, try after some time",
    data: {},
  });
});

app.listen(PORT, () => {
  console.log(`Server is listening at port:${PORT}`);
});

module.exports.handler = serverless(app);
