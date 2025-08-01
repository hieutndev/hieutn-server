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

	async uploadAppIcon(imageFile, appIconName) {
		return super.s3Upload(imageFile, {
			imageName: appIconName,
			fit: 'cover',
			isResize: true,
			width: 1000,
			height: 1000,
		});
	}

	async getAllApps(filter = "all", isGetIconUrl = false) {

		const { isCompleted, message, results } = await super.query(appSQL.getAllApps);

		if (!isCompleted) {
			throw message
		}

		let listApps = results;


		if (filter === "onlyShow") {
			listApps = results.filter((app) => app.is_hide === 0);
		} else if (filter === "onlyHide") {
			listApps = results.filter((app) => app.is_hide === 1);
		}

		return await Promise.all(listApps.map(async (app) => {
			app.app_icon = isGetIconUrl ? await s3.getObject(app.app_icon) : app.app_icon;
			app.app_icon_name = app.app_icon;
			return app
		}))

	}

	async getAppById(appId, isParseIconUrl = false) {
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
			app_icon: isParseIconUrl ? await s3.getObject(appInfo.results[0].app_icon) : appInfo.results[0].app_icon,
		}

	}

	async createNewApp(appName, appLink, appIconName) {

		const { isCompleted, message, results } = await super.query(appSQL.addNewApp, [appName, appIconName, appLink])

		if (!isCompleted) {
			await super.s3Delete(appIconName);

			throw message;
		}

		return results.insertId;

	}

	async updateAppInfo(appId, appName, appLink) {
		const {
			isCompleted,
			message,
			results
		} = await super.query(appSQL.updateAppInformation, [appName, appLink, appId]);


		if (!isCompleted) {
			throw message
		}

		return true;

	}

	async updateAppDisplayStatus(appId, newStatus) {
		const { isCompleted, message } = await super.query(appSQL.updateAppDisplayStatus, [newStatus, appId])

		if (!isCompleted) {
			throw message
		}

		return true;
	}

	async deleteApp(appId, appIconName) {

		const [, { isCompleted, message }] = await Promise.all([
			appIconName && super.s3Delete(appIconName),
			super.query(appSQL.deleteApp, [appId])
		])

		if (!isCompleted) {
			throw message;
		}

		return true;
	}

}

module.exports = new AppService()