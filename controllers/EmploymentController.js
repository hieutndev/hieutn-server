const BaseController = require("./BaseController")
const EmploymentService = require("../services/EmploymentService");
const { RESPONSE_CODE } = require("../constants/response-code");

class EmploymentController extends BaseController {
	constructor() {
		super();
	}

	async getListEmployment(req, res, next) {
		try {

			const listEmployment = await EmploymentService.getListEmployment();


			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS.SUCCESS_GET_ALL.CODE, listEmployment)

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async addNewEmployment(req, res, next) {
		try {

			const { title, organization, time_start, time_end } = req.body;

			const newEmploymentId = await EmploymentService.addNewEmployment(title, organization, time_start, time_end);

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS.SUCCESS_CREATE.CODE, { newEmploymentId })

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async getEmploymentDetails(req, res, next) {
		try {

			const { employmentId } = req.params;

			const employmentInfo = await EmploymentService.getEmploymentInfoById(employmentId);

			if (!employmentInfo) {
				return super.createResponse(res, 404, RESPONSE_CODE.ERROR.NOT_FOUND.CODE)
			}

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS.SUCCESS_GET_ONE.CODE, employmentInfo);

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async updateEmploymentDetails(req, res, next) {
		try {

			const { employmentId } = req.params;

			const { title, organization, time_start, time_end } = req.body;

			const employmentInfo = await EmploymentService.getEmploymentInfoById(employmentId);

			if (!employmentInfo) {
				return super.createResponse(res, 404, RESPONSE_CODE.ERROR.NOT_FOUND.CODE)
			}

			await EmploymentService.updateEmploymentDetails(employmentId, title, organization, time_start, time_end);

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS.SUCCESS_UPDATE.CODE)

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async permanentDeleteEmployment(req, res, next) {
		try {

			const { employmentId } = req.params;

			const employmentInfo = await EmploymentService.getEmploymentInfoById(employmentId);

			if (!employmentInfo) {
				return super.createResponse(res, 404, RESPONSE_CODE.ERROR.NOT_FOUND.CODE)
			}

			if (employmentInfo.is_deleted === 0) {
				return super.createResponse(res, 404, RESPONSE_CODE.ERROR.NOT_IN_SOFT_DELETE.CODE);
			}

			await EmploymentService.permanentDeleteEmployment(employmentId)

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS.SUCCESS_DELETE.CODE)

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async softDeleteEmployment(req, res, next) {
		try {
			const { employmentId } = req.params;

			const employmentInfo = await EmploymentService.getEmploymentInfoById(employmentId);

			if (!employmentInfo) {
				return super.createResponse(res, 404, RESPONSE_CODE.ERROR.NOT_FOUND.CODE)
			}

			if (employmentInfo.is_deleted === 1) {
				return super.createResponse(res, 404, RESPONSE_CODE.ERROR.ALREADY_IN_SOFT_DELETE.CODE);
			}

			await EmploymentService.softDeleteEmployment(employmentId)

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS.SUCCESS_DELETE.CODE)

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async recoverEmployment(req, res, next) {
		try {
			const { employmentId } = req.params;

			const employmentInfo = await EmploymentService.getEmploymentInfoById(employmentId);

			if (!employmentInfo) {
				return super.createResponse(res, 404, RESPONSE_CODE.ERROR.NOT_FOUND.CODE)
			}

			if (employmentInfo.is_deleted === 0) {
				return super.createResponse(res, 404, RESPONSE_CODE.ERROR.NOT_IN_SOFT_DELETE.CODE);
			}

			await EmploymentService.recoverEmployment(employmentId)

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS.SUCCESS_RECOVER.CODE)

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}
}

module.exports = new EmploymentController();