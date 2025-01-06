const BaseService = require("./BaseService");

class GameCardService extends BaseService {
	constructor() {
		super();
	}

	async getAllRooms() {
		return await this.query("SELECT * FROM test");


	}

}

module.exports = new GameCardService();