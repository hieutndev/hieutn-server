const express = require('express');
const router = express.Router();

const GameCardController = require('../controllers/GameCardController');


router.use('/', GameCardController.getAllRooms);

module.exports = router;
