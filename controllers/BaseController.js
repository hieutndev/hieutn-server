const mySLQ = require("../configs/mysql")

class BaseController {
	constructor() {

	}

	async createSuccessResponse(res, status, message, results) {
		return res.status(status).json({
			status: "success",
			message: message,
			results
		});
	}

}

module.exports = BaseController;