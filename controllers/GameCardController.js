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
			next({
				status: 500,
				error
			});
		}
	}

}

module.exports = new GameCardController();