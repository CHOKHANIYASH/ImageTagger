const multer = require("multer");
const path = require("path");

const storage = multer.memoryStorage();
const upload = multer({ storage });

const isAdmin = (req, res, next) => {
  // if (!req.user.role || req.user.role !== "admin") {
  //   return res.status(403).json({ message: "Forbidden" });
  // }
  console.log("isAdmin middleware");
  next();
};

module.exports = { upload, isAdmin };
