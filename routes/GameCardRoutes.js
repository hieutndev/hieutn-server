const express = require('express');
const router = express.Router();


const GameCardController = require('../controllers/GameCardController');


router.get('/', GameCardController.getAllRooms);
router.post('/', GameCardController.createNewRoom);

router.get("/:roomId/match-results", GameCardController.getRoomMatchResults)
router.post("/:roomId/match-results", GameCardController.insertNewResults)
router.get("/:roomId/results", GameCardController.getRoomResults)
router.get("/:roomId", GameCardController.getRoomDetails)
router.patch("/:roomId", GameCardController.updateRoomConfig)
router.patch("/:roomId/close-room", GameCardController.closeRoom)

module.exports = router;
