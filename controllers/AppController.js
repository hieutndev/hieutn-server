const BaseController = require("./BaseController")
const AppService = require("../services/AppService")
const { RESPONSE_CODE } = require("../constants/response-code");
const generateUniqueString = require("../utils/generate-unique-string")

class AppController extends BaseController {
	constructor() {
		super()
	}

	async getAllApps(req, res, next) {
		try {
			const { filter, search, page, limit } = req.query;

			const validFilter = ["all", "onlyShow", "onlyHide"];

			if (filter && !validFilter.includes(filter)) {
				return super.createResponse(res, 404, RESPONSE_CODE.INVALID_FILTER_APP);
			}

			// Parse and validate pagination parameters
			const options = {
				search: search || '',
				page: parseInt(page) || 1,
				limit: parseInt(limit) || 10
			};

			// Validate page and limit values
			if (options.page < 1) options.page = 1;
			if (options.limit < 1 || options.limit > 100) options.limit = 10;

			const {results, ...metadata} = await AppService.getAllApps(filter ?? "all", true, options);

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS_GET_ALL_APPS, results, metadata)

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async getAppDetails(req, res, next) {
		try {

			const { appId } = req.params;

			const appInfo = await AppService.getAppById(appId, true);

			if (!appInfo) {
				return super.createResponse(res, 404, RESPONSE_CODE.APP_NOT_FOUND)
			}

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS_GET_APP_INFO, appInfo)

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async addNewApp(req, res, next) {
		try {

			const { app_name, app_link } = req.body;


			let appIconName = null;
			if (req.file) {
				appIconName = `app_${generateUniqueString()}`;

				await AppService.uploadAppIcon(req.file, appIconName)
			}

			const newAppId = await AppService.createNewApp(app_name, app_link, appIconName)

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS_ADD_APP, {
				newAppId
			})

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async updateAppInfo(req, res, next) {
		try {

			const { appId } = req.params

			const { app_name, app_link } = req.body;

			const appInfo = await AppService.getAppById(appId);

			if (!appInfo) {
				return super.createResponse(res, 404, RESPONSE_CODE.APP_NOT_FOUND)
			}

			await Promise.all([
				req.file && AppService.uploadAppIcon(req.file, appInfo.app_icon_name),
				AppService.updateAppInfo(appId, app_name, app_link),
			]);

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS_UPDATE_APP_INFO)

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async updateAppDisplayStatus(req, res, next) {
		try {

			const { new_status, app_id } = req.body;

			await AppService.updateAppDisplayStatus(app_id, new_status)

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS_UPDATE_APP_DISPLAY_STATUS);

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async deleteApp(req, res, next) {
		try {

			const { appId } = req.params

			const appInfo = await AppService.getAppById(appId);

			if (!appInfo) {
				return super.createResponse(res, 404, RESPONSE_CODE.APP_NOT_FOUND);
			}

			await AppService.deleteApp(appId, appInfo.app_icon_name);

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS_DELETE_APP)

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}
}

module
	.exports = new AppController();