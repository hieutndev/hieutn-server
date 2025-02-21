const BaseService = require('./BaseService');
const Message = require("../utils/response-message");
const { appSQL } = require("../utils/sql-query-string");
const randomUniqueString = require("../utils/generate-unique-string")

const s3 = require("../configs/s3-bucket");
const { RESPONSE_CODE } = require('../constants/response-code');
const { is } = require('express/lib/request');

class AppService extends BaseService {
	constructor() {
		super();
	}

	async getAllApps(filter = "all") {

		const validFilter = ["all", "onlyDisplay", "onlyHide"];

		if (!validFilter.includes(filter)) {
			return {
				isCompleted: false,
				message: RESPONSE_CODE.ERROR.INVALID_FIELD_VALUE.CODE
			}
		}

		try {

			const queryListApps = await super.query(appSQL.getAllApps);

			if (!queryListApps.isCompleted) {
				return {
					isCompleted: false,
					message: queryListApps.message,
				}
			}

			let listApps = queryListApps.results;


			if (filter === "onlyShow") {
				listApps = queryListApps.results.filter((app) => app.is_hide === 0);
			} else if (filter === "onlyHide") {
				listApps = queryListApps.results.filter((app) => app.is_hide === 1);
			}

			const listAppsMapIcon = await Promise.all(listApps.map(async (app) => {
				app.app_icon = await s3.getObject(app.app_icon);
				return app
			}))

			return {
				isCompleted: true,
				message: RESPONSE_CODE.SUCCESS.SUCCESS_GET_ALL.CODE,
				results: listAppsMapIcon,
			}


		} catch (error) {
			return {
				isCompleted: false,
				message: error,
			}
		}
	}

	async getAppById(appId, getIconApp = false) {
		const appInfo = await super.query(appSQL.getAppInformation, [appId]);

		if (!appInfo.isCompleted) {
			throw new Error(appInfo.message);
		}

		if (appInfo.results.length === 0) {
			return false;
		}

		return {
			...appInfo.results[0],
			app_icon_name: appInfo.results[0].app_icon,
			app_icon: getIconApp ? await s3.getObject(appInfo.results[0].app_icon) : appInfo.results[0].app_icon,
		}

	}

	async getAppDetails(appId) {
		try {
			const appInfo = await this.getAppById(appId, true);

			return {
				isCompleted: appInfo ? true : false,
				message: appInfo ? RESPONSE_CODE.SUCCESS.SUCCESS_GET_ONE.CODE : RESPONSE_CODE.ERROR.NOT_FOUND.CODE,
				results: appInfo || {},
			}

		} catch (error) {
			return {
				isCompleted: false,
				message: error,
			}
		}
	}



	async addNewApp({ app_name, app_link }, icon_file) {
		try {

			const appIconName = randomUniqueString();

			const [addNewAppStatus, uploadAppIconStatus] = await Promise.all([super.query(appSQL.addNewApp, [app_name, appIconName, app_link]), await s3.putObject(appIconName, icon_file)])

			if (!addNewAppStatus.isCompleted) {

				await s3.deleteObject(appIconName);

				return {
					isCompleted: false,
					message: addNewAppStatus.message,
				}
			}

			return {
				isCompleted: true,
				message: RESPONSE_CODE.SUCCESS.SUCCESS_CREATE.CODE,
			}

		} catch (error) {
			return {
				isCompleted: false,
				message: error,
			}
		}
	}

	async updateAppIcon(appId, appIcon) {
		try {

			const appInfo = await this.getAppById(appId, false);

			if (!appInfo) {
				throw new Error(RESPONSE_CODE.ERROR.NOT_FOUND.CODE)
			}

			await s3.putObject(appInfo.app_icon_name, appIcon);

			return true

		} catch (error) {
			throw error;
		}
	}

	async updateAppInfo(app_id, { app_name, app_link, is_change_icon }, icon_file) {
		try {

			const updateAppInfoStatus = await super.query(appSQL.updateAppInformation, [app_name, app_link, app_id]);

			console.log("updateAppInfoStatus", updateAppInfoStatus);

			if (!updateAppInfoStatus.isCompleted) {
				return {
					isCompleted: false,
					message: updateAppInfoStatus.message,
				}
			}

			if (is_change_icon === "true") {
				const updateIcon = await this.updateAppIcon(app_id, icon_file);
				console.log(updateIcon);
			}

			return {
				isCompleted: true,
				message: RESPONSE_CODE.SUCCESS.SUCCESS_UPDATE.CODE
			}

		} catch (error) {
			return {
				isCompleted: false,
				message: error,
			}
		}
	}

	async updateAppDisplayStatus(app_id, { new_status }) {
		try {

			const updateDisplayStatus = await super.query(appSQL.updateAppDisplayStatus, [new_status, app_id])

			return {
				isCompleted: updateDisplayStatus.isCompleted,
				message: updateDisplayStatus.isCompleted ? RESPONSE_CODE.SUCCESS.SUCCESS_UPDATE.CODE : updateDisplayStatus.message,
			}
		} catch (error) {
			return {
				isCompleted: false,
				message: error,
			}
		}
	}

	async deleteApp(app_id) {
		try {

			const appInfo = await this.getAppById(app_id);

			if (!appInfo) {
				return {
					isCompleted: false,
					message: RESPONSE_CODE.ERROR.NOT_FOUND.CODE,
				}
			}

			const [, deleteApp] = await Promise.all([
				s3.deleteObject(appInfo.app_icon_name),
				super.query(appSQL.deleteApp, [app_id])
			])

			if (!deleteApp.isCompleted) {
				return {
					isCompleted: false,
					message: deleteApp.message
				}
			}

			return {
				isCompleted: true,
				message: RESPONSE_CODE.SUCCESS.SUCCESS_DELETE.CODE,
			}


		} catch (error) {
			return {
				isCompleted: false,
				message: error,
			}
		}
	}

}

module.exports = new AppService()