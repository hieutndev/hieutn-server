const express = require('express');
const router = express.Router();

const BadmintonController = require('../controllers/BadmintonController');
const { accessTokenChecker } = require("../middlewares/token-middlewares");

router.get("/", BadmintonController.getAllRooms);
router.post("/", accessTokenChecker, BadmintonController.createNewRoom);
router.get("/:roomId", BadmintonController.getRoomDetails);

module.exports = router;