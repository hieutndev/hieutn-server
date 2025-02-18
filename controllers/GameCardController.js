const BaseController = require('./BaseController');
const GameCardService = require('../services/GameCardService');
const Message = require("../utils/response-message");

class GameCardController extends BaseController {

	constructor() {
		super();
	}

	async getAllRooms(req, res, next) {
		try {
			const { isCompleted, message, results } = await GameCardService.getAllRooms();

			if (isCompleted === false) {
				return super.createResponse(res, 400, message)
			}

			return super.createResponse(res, 200, message, results);

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async getRoomDetails(req, res, next) {
		try {
			const { roomId } = req.params;

			const { isCompleted, message, results } = await GameCardService.getRoomInfo(roomId);

			if (isCompleted === false) {
				return super.createResponse(res, 400, message)
			}

			return super.createResponse(res, 200, message, results);

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async createNewRoom(req, res, next) {
		try {
			const { roomConfig } = req.body;

			const { isCompleted, message, results } = await GameCardService.createNewRoom(req.user_id, roomConfig);

			if (isCompleted === false) {
				return super.createResponse(res, 400, message)
			}

			return super.createResponse(res, 200, message, results);
		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async getRoomMatchResults(req, res, next) {
		try {

			const { roomId } = req.params;

			const { isCompleted, message, results } = await GameCardService.getListPlayHistory(roomId);

			if (isCompleted === false) {
				return super.createResponse(res, 400, message);
			}

			return super.createResponse(res, 200, message, results);

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async insertNewResults(req, res, next) {
		try {

			const { roomId } = req.params;

			const { player1Result, player2Result, player3Result, player4Result, twoPlayResults } = req.body;

			const {
				isCompleted,
				message,
				results
			} = await GameCardService.insertNewResult(roomId, player1Result, player2Result, player3Result, player4Result, twoPlayResults);

			if (isCompleted === false) {
				return super.createResponse(res, 400, message);
			}

			return super.createResponse(res, 200, message, results);

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async updateRoomConfig(req, res, next) {
		try {
			const { roomId } = req.params;

			const { newConfig } = req.body;

			const { isCompleted, message, results } = await GameCardService.updateRoomConfig(roomId, newConfig);

			if (isCompleted === false) {
				return super.createResponse(res, 400, message);
			}

			return super.createResponse(res, 200, message, results);
		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async getRoomResults(req, res, next) {
		try {
			const { roomId } = req.params;

			const { isCompleted, message, results } = await GameCardService.getRoomResults(roomId);

			if (!isCompleted) {
				return super.createResponse(res, 400, message);
			}

			return super.createResponse(res, 200, message, results);
		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async closeRoom(req, res, next) {
		try {
			const { roomId } = req.params;

			const { isCompleted, message, results } = await GameCardService.closeRoom(roomId);

			if (!isCompleted) {
				return super.createResponse(res, 400, message)
			}

			return super.createResponse(res, 200, message, results);
		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}
}

module.exports = new GameCardController();