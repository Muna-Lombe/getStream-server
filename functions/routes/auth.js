const express = require('express');

const {signup, login, fetchauthor} = require('../controllers/auth');

const router = express.Router();

//adding sign up and log in routes
router.post('/signup', signup);
router.post('/login', login);
router.get('/fetchauthor', fetchauthor)

module.exports = router;