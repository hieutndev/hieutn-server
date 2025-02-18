const BaseController = require("./BaseController")
const EducationService = require("../services/EducationService")
const Message = require("../utils/response-message")

class EducationController extends BaseController {
	constructor() {
		super()
	}

	async getListEducation(req, res, next) {
		try {

			const { isCompleted, message, results } = await EducationService.getAllEducation();

			if (!isCompleted) {
				return super.createResponse(res, 400, message)
			}

			return super.createResponse(res, 200, message, results)

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async getEducationDetails(req, res, next) {
		try {

			const { educationId } = req.params;

			const { isCompleted, message, results } = await EducationService.getEducationDetails(educationId);

			if (!isCompleted) {
				return super.createResponse(res, 400, message)
			}

			return super.createResponse(res, 200, message, results)

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async addNewEducation(req, res, next) {
		try {
			const { isCompleted, message, results } = await EducationService.addNewEducation(req.body);

			if (!isCompleted) {
				return super.createResponse(res, 400, message)
			}

			return super.createResponse(res, 200, message, results)
		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async updateEducationDetails(req, res, next) {
		try {

			const { educationId } = req.params;

			const {
				isCompleted,
				message,
			} = await EducationService.updateEducationDetails(educationId, req.body);

			if (!isCompleted) {
				return super.createResponse(res, 400, message)
			}

			return super.createResponse(res, 200, message)

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async softDeleteEducation(req, res, next) {
		try {

			const { educationId } = req.params;

			const { isCompleted, message } = await EducationService.softDeleteEducation(educationId);

			if (!isCompleted) {
				return super.createResponse(res, 400, message)
			}

			return super.createResponse(res, 200, message)

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async permanentDeleteEducation(req, res, next) {
		try {

			const { educationId } = req.params;

			const { isCompleted, message } = await EducationService.permanentDeleteEducation(educationId);

			if (!isCompleted) {
				return super.createResponse(res, 400, message)
			}

			return super.createResponse(res, 200, message)

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async recoverEducation(req, res, next) {
		try {

			const { educationId } = req.params;

			const { isCompleted, message } = await EducationService.recoverEducation(educationId);

			if (!isCompleted) {
				return super.createResponse(res, 400, message)
			}

			return super.createResponse(res, 200, message)

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}
}

module.exports = new EducationController();