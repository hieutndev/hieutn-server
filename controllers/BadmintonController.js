const BaseController = require('./BaseController');

const BadmintonService = require('../services/BadmintonService');

class BadmintonController extends BaseController {
	constructor() {
		super();
	}

	async getAllRooms(req, res, next) {

	}

	async createNewRoom(req, res, next) {
		try {

			const { isCompleted, message, results } = await BadmintonService.createNewRoom(req.body, req.user_id);

			if (!isCompleted) {
				return super.createResponse(res, 400, message);
			}

			return super.createResponse(res, 201, message, results);

		} catch (error) {
			return super.createResponse(res, 500, error);
		}
	}

	async getRoomDetails(req, res, next) {
		try {

			const { roomId } = req.params;

			const { isCompleted, message, results } = await BadmintonService.getRoomDetails(roomId);

			return super.createResponse(res, isCompleted ? 200 : 400, message, results)

		} catch (error) {
			return super.createResponse(res, 500, error);
		}
	}

}

module.exports = new BadmintonController();