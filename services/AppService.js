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

	async getAllApps(filter = "all", isGetIconUrl = false, options = {}) {
		const {
			search = '',
			page = 1,
			limit = 10
		} = options;

		// Calculate offset for pagination
		const offset = (page - 1) * limit;

		let countQuery, dataQuery, countParams, dataParams;
		const hasSearch = search && search.trim();
		const hasFilter = filter === "onlyShow" || filter === "onlyHide";
		const searchTerm = hasSearch ? `%${search.trim()}%` : null;
		const filterValue = filter === "onlyShow" ? 0 : 1;

		// Determine which queries to use based on search and filter
		if (hasSearch && hasFilter) {
			countQuery = appSQL.countAppsWithSearchAndFilter;
			dataQuery = appSQL.getAllAppsWithSearchAndFilter;
			countParams = [searchTerm, filterValue];
			dataParams = [searchTerm, filterValue, limit, offset];
		} else if (hasSearch && !hasFilter) {
			countQuery = appSQL.countAppsWithSearch;
			dataQuery = appSQL.getAllAppsWithSearch;
			countParams = [searchTerm];
			dataParams = [searchTerm, limit, offset];
		} else if (!hasSearch && hasFilter) {
			countQuery = appSQL.countAppsWithFilter;
			dataQuery = appSQL.getAllAppsWithFilter;
			countParams = [filterValue];
			dataParams = [filterValue, limit, offset];
		} else {
			countQuery = appSQL.countAppsWithoutSearchAndFilter;
			dataQuery = appSQL.getAllAppsWithoutSearchAndFilter;
			countParams = [];
			dataParams = [limit, offset];
		}

		// Get total count for pagination
		const { isCompleted: countCompleted, message: countMessage, results: countResults } = await super.query(countQuery, countParams);

		if (!countCompleted) {
			throw countMessage;
		}

		const totalCount = countResults[0].total;

		// Get paginated results
		const { isCompleted, message, results } = await super.query(dataQuery, dataParams);

		if (!isCompleted) {
			throw message;
		}

		// Process app icons
		const processedApps = await Promise.all(results.map(async (app) => {
			app.app_icon = isGetIconUrl ? await s3.getObject(app.app_icon) : app.app_icon;
			app.app_icon_name = app.app_icon;
			return app;
		}));

		return {
			results: processedApps,
			totalCount,
			page,
			limit,
			totalPages: Math.ceil(totalCount / limit)
		};
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