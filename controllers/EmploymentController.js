const BaseController = require("./BaseController")
const EmploymentService = require("../services/EmploymentService");
const { RESPONSE_CODE } = require("../constants/response-code");

class EmploymentController extends BaseController {
	constructor() {
		super();
	}

	async getListEmployment(req, res, next) {
		try {
			const { search, page, limit } = req.query;

			// Parse and validate pagination parameters
			const options = {
				search: search || '',
				page: parseInt(page) || 1,
				limit: parseInt(limit) || 10
			};

			// Validate page and limit values
			if (options.page < 1) options.page = 1;
			if (options.limit < 1 || options.limit > 100) options.limit = 10;

			const {results, ...metadata} = await EmploymentService.getListEmployment(options);

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS_GET_ALL_EMPLOYMENTS, results, metadata)

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async addNewEmployment(req, res, next) {
		try {

			const { title, organization, time_start, time_end } = req.body;

			const newEmploymentId = await EmploymentService.addNewEmployment(title, organization, time_start, time_end);

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS_ADD_EMPLOYMENT, { newEmploymentId })

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async getEmploymentDetails(req, res, next) {
		try {

			const { employmentId } = req.params;

			const employmentInfo = await EmploymentService.getEmploymentInfoById(employmentId);

			if (!employmentInfo) {
				return super.createResponse(res, 404, RESPONSE_CODE.EMPLOYMENT_NOT_FOUND)
			}

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS_GET_EMPLOYMENT_INFO, employmentInfo);

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
				return super.createResponse(res, 404, RESPONSE_CODE.EMPLOYMENT_NOT_FOUND)
			}

			await EmploymentService.updateEmploymentDetails(employmentId, title, organization, time_start, time_end);

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS_UPDATE_EMPLOYMENT_INFO)

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async permanentDeleteEmployment(req, res, next) {
		try {

			const { employmentId } = req.params;

			const employmentInfo = await EmploymentService.getEmploymentInfoById(employmentId);

			if (!employmentInfo) {
				return super.createResponse(res, 404, RESPONSE_CODE.EMPLOYMENT_NOT_FOUND)
			}

			if (employmentInfo.is_deleted === 0) {
				return super.createResponse(res, 404, RESPONSE_CODE.NOT_IN_SOFT_DELETE);
			}

			await EmploymentService.permanentDeleteEmployment(employmentId)

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS_DELETE_EMPLOYMENT)

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async softDeleteEmployment(req, res, next) {
		try {
			const { employmentId } = req.params;

			const employmentInfo = await EmploymentService.getEmploymentInfoById(employmentId);

			if (!employmentInfo) {
				return super.createResponse(res, 404, RESPONSE_CODE.EMPLOYMENT_NOT_FOUND)
			}

			if (employmentInfo.is_deleted === 1) {
				return super.createResponse(res, 404, RESPONSE_CODE.ALREADY_IN_SOFT_DELETE);
			}

			await EmploymentService.softDeleteEmployment(employmentId)

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS_DELETE_EMPLOYMENT)

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async recoverEmployment(req, res, next) {
		try {
			const { employmentId } = req.params;

			const employmentInfo = await EmploymentService.getEmploymentInfoById(employmentId);

			if (!employmentInfo) {
				return super.createResponse(res, 404, RESPONSE_CODE.EMPLOYMENT_NOT_FOUND)
			}

			if (employmentInfo.is_deleted === 0) {
				return super.createResponse(res, 404, RESPONSE_CODE.NOT_IN_SOFT_DELETE);
			}

			await EmploymentService.recoverEmployment(employmentId)

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS_RECOVER_EMPLOYMENT)

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}
}

module.exports = new EmploymentController();