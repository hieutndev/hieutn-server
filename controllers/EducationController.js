const BaseController = require("./BaseController")
const EducationService = require("../services/EducationService")
const Message = require("../utils/response-message")
const { RESPONSE_CODE } = require("../constants/response-code");

class EducationController extends BaseController {
	constructor() {
		super()
	}

	async getListEducation(req, res, next) {
		try {

			const listEdu = await EducationService.getAllEducation();

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS.SUCCESS_GET_ALL, listEdu)

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async getEducationDetails(req, res, next) {
		try {

			const { educationId } = req.params;

			const educationInfo = await EducationService.getEducationById(educationId);

			if (!educationInfo) {
				return super.createResponse(res, 404, RESPONSE_CODE.ERROR.NOT_FOUND.CODE);
			}

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS.SUCCESS_GET_ONE.CODE, educationInfo)

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async addNewEducation(req, res, next) {
		try {
			const { title, organization, time_start, time_end } = req.body;

			const newEduId = await EducationService.addNewEducation(title, organization, time_start, time_end);

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS.SUCCESS_CREATE, {
				newEduId
			})
		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async updateEducationDetails(req, res, next) {
		try {

			const { educationId } = req.params;

			const { title, organization, time_start, time_end } = req.body;

			const eduInfo = await EducationService.getEducationById(educationId);

			if (!eduInfo) {
				return super.createResponse(res, 404, RESPONSE_CODE.ERROR.NOT_FOUND.CODE);
			}

			await EducationService.updateEducationDetails(educationId, title, organization, time_start, time_end);

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS.SUCCESS_UPDATE.CODE)

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async softDeleteEducation(req, res, next) {
		try {

			const { educationId } = req.params;

			const eduInfo = await EducationService.getEducationById(educationId);

			if (!eduInfo) {
				return super.createResponse(res, 404, RESPONSE_CODE.ERROR.NOT_FOUND.CODE);
			}

			if (eduInfo.is_deleted === 1) {
				return super.createResponse(res, 404, RESPONSE_CODE.ERROR.ALREADY_IN_SOFT_DELETE.CODE)
			}

			await EducationService.softDeleteEducation(educationId);

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS.SUCCESS_DELETE.CODE)

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async permanentDeleteEducation(req, res, next) {
		try {

			const { educationId } = req.params;

			const eduInfo = await EducationService.getEducationById(educationId);

			if (!eduInfo) {
				return super.createResponse(res, 404, RESPONSE_CODE.ERROR.NOT_FOUND.CODE);
			}

			if (eduInfo.is_deleted === 0) {
				return super.createResponse(res, 404, RESPONSE_CODE.ERROR.NOT_IN_SOFT_DELETE.CODE)
			}

			await EducationService.permanentDeleteEducation(educationId);

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS.SUCCESS_DELETE.CODE)


		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async recoverEducation(req, res, next) {
		try {

			const { educationId } = req.params;

			const eduInfo = await EducationService.getEducationById(educationId);

			if (!eduInfo) {
				return super.createResponse(res, 404, RESPONSE_CODE.ERROR.NOT_FOUND.CODE);
			}

			if (eduInfo.is_deleted === 0) {
				return super.createResponse(res, 404, RESPONSE_CODE.ERROR.NOT_IN_SOFT_DELETE.CODE)
			}

			await EducationService.recoverEducation(educationId);

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS.SUCCESS_RECOVER.CODE)

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}
}

module.exports = new EducationController();