const express = require("express");

const {create, read, update, remove} = require("../controllers/user");

// eslint-disable-next-line new-cap
const router = express.Router();

// adding sign up and log in routes
router.post("/create", create);
router.post("/read", read);
router.post("/update", update);
router.post("/remove", remove);

module.exports = router;
