const express = require("express");

const {signup, login, fetchauthor, test} = require("../controllers/auth");

// eslint-disable-next-line new-cap
const router = express.Router();

// adding sign up and log in routes
router.post("/signup", signup);
router.post("/login", login);
router.get("/fetchauthor", fetchauthor);
router.get("/test", test);

module.exports = router;
