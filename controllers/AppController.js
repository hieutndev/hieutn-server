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
			const { filter } = req.query;

			const validFilter = ["all", "onlyShow", "onlyHide"];

			if (!validFilter.includes(filter)) {
				return super.createResponse(res, 404, RESPONSE_CODE.ERROR.INVALID_FIELD_VALUE.CODE);
			}

			const listApps = await AppService.getAllApps(filter);

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS.SUCCESS_GET_ALL.CODE, listApps)

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async getAppDetails(req, res, next) {
		try {

			const { appId } = req.params;

			const appInfo = await AppService.getAppById(appId, true);

			if (!appInfo) {
				return super.createResponse(res, 404, RESPONSE_CODE.ERROR.NOT_FOUND.CODE)
			}

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS.SUCCESS_GET_ONE.CODE, appInfo)

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async addNewApp(req, res, next) {
		try {

			const { app_name, app_link } = req.body;


			let appIconName = null;
			if (!req.file) {
				appIconName = `app_${generateUniqueString()}`;

				await AppService.uploadAppIcon(req.file, appIconName)
			}

			const newAppId = await AppService.createNewApp(app_name, app_link, appIconName)

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS.SUCCESS_CREATE.CODE, {
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
				return super.createResponse(res, 404, RESPONSE_CODE.ERROR.NOT_FOUND.CODE)
			}

			await Promise.all([
				req.file && AppService.uploadAppIcon(req.file, appInfo.app_icon_name),
				AppService.updateAppInfo(appId, app_name, app_link),
			]);

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS.SUCCESS_UPDATE.CODE)

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async updateAppDisplayStatus(req, res, next) {
		try {

			const { appId } = req.params;

			const { new_status } = req.body;

			await AppService.updateAppDisplayStatus(appId, new_status)

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS.SUCCESS_UPDATE.CODE);

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async deleteApp(req, res, next) {
		try {

			const { appId } = req.params

			const appInfo = await AppService.getAppById(appId);

			if (!appInfo) {
				return super.createResponse(res, 404, RESPONSE_CODE.ERROR.NOT_FOUND.CODE);
			}

			await AppService.deleteApp(appId, appInfo.app_icon_name);

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS.SUCCESS_DELETE.CODE)

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}
}

module
	.exports = new AppController();