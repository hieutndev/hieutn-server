const BaseController = require("./BaseController")

const EmploymentService = require("../services/EmploymentService");

class EmploymentController extends BaseController {
	constructor() {
		super();
	}

	async getListEmployment(req, res, next) {
		try {

			const { isCompleted, message, results } = await EmploymentService.getListEmployment();

			if (!isCompleted) {
				return {
					status: 400,
					message,
				}
			}

			return super.createSuccessResponse(res, 200, message, results)

		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}

	async addNewEmployment(req, res, next) {
		try {

			const { isCompleted, message, results } = await EmploymentService.addNewEmployment(req.body);

			if (!isCompleted) {
				return {
					status: 400,
					message,
				}
			}

			return super.createSuccessResponse(res, 200, message, results)


		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}

	async getEmploymentDetails(req, res, next) {
		try {

			const {
				isCompleted,
				message,
				results
			} = await EmploymentService.getEmploymentDetails(req.params.employmentId);

			if (!isCompleted) {
				return {
					status: 400,
					message,
				}
			}

			return super.createSuccessResponse(res, 200, message, results)


		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}

	async updateEmploymentDetails(req, res, next) {
		try {

			const { employmentId } = req.params;

			const {
				isCompleted,
				message,
				results
			} = await EmploymentService.updateEmploymentDetails(employmentId, req.body);

			if (!isCompleted) {
				return {
					status: 400,
					message,
				}
			}

			return super.createSuccessResponse(res, 200, message, results)

		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}

	async permanentDeleteEmployment(req, res, next) {
		try {

			const { employmentId } = req.params;

			const { isCompleted, message } = await EmploymentService.permanentDeleteEmployment(employmentId)

			if (!isCompleted) {
				return {
					status: 400,
					message,
				}
			}

			return super.createSuccessResponse(res, 200, message)

		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}

	async softDeleteEmployment(req, res, next) {
		try {
			const { employmentId } = req.params;

			const { isCompleted, message } = await EmploymentService.softDeleteEmployment(employmentId)

			if (!isCompleted) {
				return {
					status: 400,
					message,
				}
			}

			return super.createSuccessResponse(res, 200, message)

		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}

	async recoverEmployment(req, res, next) {
		try {
			const { employmentId } = req.params;

			const { isCompleted, message } = await EmploymentService.recoverEmployment(employmentId)

			if (!isCompleted) {
				return {
					status: 400,
					message,
				}
			}

			return super.createSuccessResponse(res, 200, message)

		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}
}

module.exports = new EmploymentController();