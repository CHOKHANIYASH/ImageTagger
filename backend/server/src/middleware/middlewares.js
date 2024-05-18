const multer = require("multer");
const path = require("path");
const jwt = require("jsonwebtoken");
const storage = multer.memoryStorage();
const upload = multer({ storage });
const { dynamodbClient } = require("../aws/clients");
const { GetItemCommand } = require("@aws-sdk/client-dynamodb");
const isAdmin = (req, res, next) => {
  // if (!req.user.role || req.user.role !== "admin") {
  //   return res.status(403).json({ message: "Forbidden" });
  // }
  console.log("isAdmin middleware");
  next();
};

class AppError extends Error {
  constructor(message, status) {
    super();
    this.name = "AppError";
    this.status = status;
    this.message = message;
  }
}

const handleAsyncError = (fn) => (req, res, next) => {
  fn(req, res, next).catch((err) => next(err));
};

const isValidUser = handleAsyncError(async (req, res, next) => {
  // console.log(req.headers);
  const { userId } = req.params;
  const access_token = req.headers.access_token;
  if (!access_token) {
    throw new AppError("Unauthorized", 401);
  }
  const decoded = jwt.decode(access_token, { complete: true });
  const { sub } = decoded.payload;
  const USERID = sub;
  if (USERID !== userId) {
    throw new AppError("Unauthorized", 401);
  }
  next();
});

module.exports = { upload, isAdmin, handleAsyncError, AppError, isValidUser };
