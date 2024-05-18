const router = require("express").Router();
const userControllers = require("../controllers/userControllers");
// const { addBlog, getUserBlogs } = require("../controllers/blogsControllers");
// const { sendBlogEmail } = require("../controllers/sesControllers");
const {
  isAdmin,
  isValidUser,
  handleAsyncError,
} = require("../middleware/middlewares");

router.get(
  "/",
  isAdmin,
  handleAsyncError(async (req, res) => {
    const response = await userControllers.getAllUsers();
    res.status(200).send(response);
  })
);

router.post(
  "/signup",
  handleAsyncError(async (req, res) => {
    const { username, password, email, firstname, lastname } = req.body;
    const { status, response } = await userControllers.signUp({
      username,
      password,
      email,
      lastname,
      firstname,
    });
    res.status(status).send(response); // 201 status code for resource created
  })
);

router.post(
  "/login",
  handleAsyncError(async (req, res) => {
    const { username, password } = req.body;
    const response = await userControllers.login({ username, password });
    res.status(response.status).send(response); // 200 status code for success
  })
);
router.post(
  "/accesstoken",
  handleAsyncError(async (req, res) => {
    const refreshToken = req.body.refreshToken;
    const username = req.body.username;
    const { status, response } = await userControllers.getAccessToken({
      refreshToken,
      username,
    });
    res.status(status).send(response);
  })
);
router.get(
  "/:userId",
  isValidUser,
  handleAsyncError(async (req, res) => {
    const { status, response } = await userControllers.getUser({
      userId: req.params.userId,
    });
    res.status(status).send(response);
  })
);
router.get(
  "/:userId/imageurls",
  isValidUser,
  handleAsyncError(async (req, res) => {
    const { status, response } = await userControllers.getUserImageUrls({
      userId: req.params.userId,
    });
    res.status(status).send(response);
  })
);

// router.post('/:userId/upload',async(req,res)=>{});
module.exports = router;
