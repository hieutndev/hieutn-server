const STATUS_TEXT = require("../constants/status-text")

class BaseController {
	constructor() {

	}

	async createResponse(res, status, message, results, metadata) {
		return res.status(status).json({
			status: STATUS_TEXT[status],
			message: message ? typeof message === "string" ? message : `${message.name} - ${message.message}` : "",
			results,
			metadata
		});
	}

}

module.exports = BaseController;