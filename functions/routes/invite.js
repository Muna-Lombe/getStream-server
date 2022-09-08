const express = require('express');

const {invite} = require('../controllers/invite');

const router = express.Router();

//adding send invite routes
router.post('/sendInvite', invite);


module.exports = router;