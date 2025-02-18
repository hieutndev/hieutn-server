const BaseController = require("./BaseController")
const AppService = require("../services/AppService")


class AppController extends BaseController {
	constructor() {
		super()
	}

	async getAllApps(req, res, next) {
		try {
			const { filter } = req.query;

			const { isCompleted, message, results } = await AppService.getAllApps(filter);


			if (!isCompleted) {
				return super.createResponse(res, 400, message)
			}

			return super.createResponse(res, 200, message, results)


		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async getAppDetails(req, res, next) {
		try {

			const { appId } = req.params;

			const { isCompleted, message, results } = await AppService.getAppDetails(appId);

			if (!isCompleted) {
				return super.createResponse(res, 400, message)
			}

			return super.createResponse(res, 200, message, results)
		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async addNewApp(req, res, next) {
		try {

			const { isCompleted, message } = await AppService.addNewApp(req.body, req.file)

			if (!isCompleted) {
				return next({
					status: 400,
					message,
				})
			}

			return super.createResponse(res, 200, message)

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async updateAppInformation(req, res, next) {
		try {

			const { appId } = req.params

			const { isCompleted, message } = await AppService.updateAppInformation(appId, req.body, req.file);

			if (!isCompleted) {
				return next({
					isCompleted: false,
					message: message
				})
			}

			return super.createResponse(res, 200, message)

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async updateAppDisplayStatus(req, res, next) {
		try {

			const { appId } = req.params;

			const { isCompleted, message } = await AppService.updateAppDisplayStatus(appId, req.body)

			if (!isCompleted) {
				return super.createResponse(res, 400, message)
			}

			return super.createResponse(res, 200, message);

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async deleteApp(req, res, next) {
		try {

			const { appId } = req.params

			const { isCompleted, message } = await AppService.deleteApp(appId);

			if (!isCompleted) {
				return super.createResponse(res, 400, message)
			}

			return super.createResponse(res, 200, message)

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}
}

module
	.exports = new AppController();