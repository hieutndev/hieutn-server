const BaseController = require('./BaseController');
const GameCardService = require('../services/GameCardService');
const Message = require("../utils/response-message");
const { RESPONSE_CODE } = require("../constants/response-code")

class GameCardController extends BaseController {

	constructor() {
		super();
	}

	async getAllRooms(req, res, next) {
		try {
			const gameRooms = await GameCardService.getAllRooms();

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS_GET_ALL_GC_ROOMS, gameRooms);

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async getRoomDetails(req, res, next) {
		try {
			const { roomId } = req.params;

			const roomInfo = await GameCardService.getRoomInfoById(roomId);

			if (!roomInfo) {
				return super.createResponse(res, 400, RESPONSE_CODE.GC_ROOM_NOT_FOUND);
			}

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS_GET_ROOM_INFO, roomInfo);

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async createNewRoom(req, res, next) {
		try {
			const { roomConfig } = req.body;

			const newRoomId = await GameCardService.createNewRoom(req.user_id);

			if (newRoomId) {
				await GameCardService.setRoomConfig(newRoomId, roomConfig);
			}

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS_CREATE_GC_ROOM, {
				newRoomId,
			});
		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async insertNewResults(req, res, next) {
		try {

			const { roomId } = req.params;

			const { player1Result, player2Result, player3Result, player4Result, twoPlayResults } = req.body;

			const roomPlayHistory = await GameCardService.getRoomPlayHistory(roomId);

			const newMatchId = GameCardService.getNewMatchId(roomPlayHistory.matchResults);

			await Promise.all([
				GameCardService.createPlayerResult(roomId, newMatchId, 1, player1Result),
				GameCardService.createPlayerResult(roomId, newMatchId, 2, player2Result),
				GameCardService.createPlayerResult(roomId, newMatchId, 3, player3Result),
				GameCardService.createPlayerResult(roomId, newMatchId, 4, player4Result),
				GameCardService.createTwoPlayResults(roomId, newMatchId, twoPlayResults)
			])

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS_CREATE_GC_MATCH_RESULT);

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async updateRoomConfig(req, res, next) {
		try {
			const { roomId } = req.params;

			const { newConfig } = req.body;

			const roomInfo = await GameCardService.getRoomInfoById(roomId);

			if (!roomInfo) {
				return super.createResponse(res, 404, RESPONSE_CODE.GC_ROOM_NOT_FOUND);
			}

			await GameCardService.updateRoomConfig(roomId, newConfig);

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS_UPDATE_GC_ROOM_CONFIG);
		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async getRoomResults(req, res, next) {
		try {
			const { roomId } = req.params;

			const roomInfo = await GameCardService.getRoomInfoById(roomId);

			if (!roomInfo) {
				return super.createResponse(res, 404, RESPONSE_CODE.GC_ROOM_NOT_FOUND);
			}

			const roomResults = await GameCardService.getRoomResults(roomId);

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS_GET_GC_ROOM_RESULTS, roomResults);

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async closeRoom(req, res, next) {
		try {
			const { roomId } = req.params;

			const roomInfo = await GameCardService.getRoomInfoById(roomId);

			if (!roomInfo) {
				return super.createResponse(res, 404, RESPONSE_CODE.GC_ROOM_NOT_FOUND);
			}

			await GameCardService.closeRoom(roomId);

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS_CLOSE_GC_ROOM);
		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async deleteMatchResult(req, res, next) {
		try {

			const { roomId, matchId } = req.params;

			const roomInfo = await GameCardService.getRoomInfoById(roomId);

			if (!roomInfo) {
				return super.createResponse(res, 404, RESPONSE_CODE.GC_ROOM_NOT_FOUND);
			}

			await GameCardService.deleteMatchResults(roomId, matchId);

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS_DELETE_MATCH_RESULT);


		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

}

module.exports = new GameCardController();