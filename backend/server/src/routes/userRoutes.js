const router = require("express").Router();
const {
  signUp,
  login,
  getUser,
  getAllUsers,
} = require("../controllers/userControllers");
// const { addBlog, getUserBlogs } = require("../controllers/blogsControllers");
// const { sendBlogEmail } = require("../controllers/sesControllers");
const { isAdmin } = require("../middleware/middlewares");

router.get("/", isAdmin, async (req, res) => {
  try {
    const response = await getAllUsers();
    res.status(200).send(response);
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    res
      .status(500)
      .send({ success: false, message: "Internal Server Error", data: {} }); // 500 status code for internal server error
  }
});

router.post("/signup", async (req, res) => {
  const { username, password, email,firstname,lastname } = req.body;
  try {
    const response = await signUp({ username, password, email ,lastname,firstname});
    res.status(response.status).send(response); // 201 status code for resource created
  } catch (error) {
    console.error("Error in signUp:", error);
    res
      .status(500)
      .send({ success: false, message: "Internal Server Error", data: {} }); // 500 status code for internal server error
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const response = await login({ username, password });
    res.status(response.status).send(response); // 200 status code for success
  } catch (err) {
    console.error("Error in login:", err);
    res
      .status(500)
      .send({ success: false, message: "Internal Server Error", data: {} });
  }
});
module.exports = router;
