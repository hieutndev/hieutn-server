const BaseController = require('./BaseController');
const GameCardService = require('../services/GameCardService');
const Message = require("../utils/ResponseMessage");

class GameCardController extends BaseController {

	constructor() {
		super();
	}

	async getAllRooms(req, res, next) {
		try {
			const { isCompleted, message, results } = await GameCardService.getAllRooms();

			if (isCompleted === false) {
				return next({
					status: 500,
					message
				});
			}

			return super.createSuccessResponse(res, 200, Message.successGetAll(`${results.length} Game Rooms`), results);

		} catch (error) {
			return next({
				status: 500,
				error
			});
		}
	}

	async getRoomDetails(req, res, next) {
		try {
			const { roomId } = req.params;

			const { isCompleted, message, results } = await GameCardService.getRoomDetails(roomId);

			if (isCompleted === false) {
				return next({
					status: 400,
					message
				});
			}

			return super.createSuccessResponse(res, 200, Message.successGetOne(`Room ${roomId}`), results);

		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}

	async createNewRoom(req, res, next) {
		try {

			const { roomConfig } = req.body;

			const { isCompleted, message, results } = await GameCardService.createNewRoom(roomConfig);

			if (isCompleted === false) {
				return next({
					status: 400,
					message
				});
			}

			return super.createSuccessResponse(res, 200, Message.successCreate("game card room"), results);
		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}

	async getRoomMatchResults(req, res, next) {
		try {

			const { roomId } = req.params;

			const { isCompleted, message, results } = await GameCardService.getRoomMatchResults(roomId);

			if (isCompleted === false) {
				return next({ status: 400, message });
			}

			return super.createSuccessResponse(res, 200, Message.successGetAll(`Room ${roomId} match results`), results);

		} catch (error) {
			return next({ status: 500, error })
		}
	}

	async insertNewResults(req, res, next) {
		try {

			const { roomId } = req.params;

			const { matchId, player1Result, player2Result, player3Result, player4Result, twoPlayResults } = req.body;

			const insertNewResult = await GameCardService.insertNewResult(roomId, matchId, player1Result, player2Result, player3Result, player4Result, twoPlayResults);

			if (insertNewResult.isCompleted === false) {
				return next({
					status: 400,
					message: insertNewResult.message
				});
			}

			const roomMatchResults = await GameCardService.getRoomMatchResults(roomId);

			if (roomMatchResults.isCompleted === false) {
				return next({
					status: 400,
					message: roomMatchResults.message
				});

			}

			return super.createSuccessResponse(res, 200, Message.successCreate("match results"), roomMatchResults.results);


		} catch (error) {
			console.log(error);
			return next({ status: 500, error });
		}
	}

	async updateRoomConfig(req, res, next) {
		try {
			const { roomId } = req.params;

			const { newConfig } = req.body;

			const updateRoomConfig = await GameCardService.updateRoomConfig(roomId, newConfig);

			if (updateRoomConfig.isCompleted === false) {
				return next({
					status: 400,
					message: updateRoomConfig.message
				});
			}

			const roomDetails = await GameCardService.getRoomDetails(roomId);

			if (!roomDetails.isCompleted) {
				return next({
					status: 400,
					message: roomDetails.message
				});
			}

			return super.createSuccessResponse(res, 200, Message.successUpdate("room config"), roomDetails.results);
		} catch (error) {
			return next({ status: 500, error });
		}
	}

	async getRoomResults(req, res, next) {
		try {
			const { roomId } = req.params;

			const roomResults = await GameCardService.getScoreBoard(roomId);

			if (!roomResults.isCompleted) {
				return next({
					status: 400,
					message: roomResults.message
				});
			}

			return super.createSuccessResponse(res, 200, Message.successGetAll(`Room ${roomId} results`), roomResults.results);
		} catch (error) {
			return next({ status: 500, error });
		}
	}
}

module.exports = new GameCardController();