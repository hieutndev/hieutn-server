const BaseService = require('./BaseService');
const Message = require("../utils/response-message");
const { appSQL } = require("../utils/sql-query-string");
const randomUniqueString = require("../utils/generate-unique-string")

const s3 = require("../configs/s3-bucket");

class AppService extends BaseService {
	constructor() {
		super();
	}

	async getAllApps(filter = "all") {
		try {

			const listApps = await super.query(appSQL.getAllApps);

			if (!listApps.isCompleted) {
				return {
					isCompleted: false,
					message: listApps.message,
				}
			}

			let finalResult = listApps.results;


			if (filter === "onlyShow") {
				finalResult = listApps.results.filter((app) => app.is_hide === 0);
			} else if (filter === "onlyHide") {
				finalResult = listApps.results.filter((app) => app.is_hide === 1);
			}

			const mapAppIcon = await Promise.all(finalResult.map(async (app) => {
				app.app_icon = await s3.getObject(app.app_icon);
				return app
			}))

			return {
				isCompleted: true,
				message: Message.successGetAll("apps"),
				results: mapAppIcon,

			}


		} catch (error) {
			return {
				isCompleted: false,
				message: error,
			}
		}
	}

	async getAppDetails(appId) {
		try {

			const appDetails = await super.query(appSQL.getAppInformation, [appId]);

			if (!appDetails.isCompleted) {
				return {
					isCompleted: false,
					message: appDetails.message,
				}
			}

			return {
				isCompleted: true,
				message: Message.successGetOne("app"),
				results: {
					...appDetails.results[0],
					app_icon: await s3.getObject(appDetails.results[0].app_icon),
					app_icon_name: appDetails.results[0].app_icon,
				}
			}

		} catch (error) {
			return {
				isCompleted: false,
				message: error,
			}
		}
	}

	async addNewApp({ app_name, app_link }, appIcon) {
		try {

			const appIconName = randomUniqueString();

			const addNewAppStatus = await super.query(appSQL.addNewApp, [app_name, appIconName, app_link]);

			if (!addNewAppStatus.isCompleted) {
				return {
					isCompleted: false,
					message: addNewAppStatus.message,
				}
			}

			await s3.putObject(appIconName, appIcon);

			return {
				isCompleted: true,
				message: Message.successCreate("app")
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

			const appDetails = await this.getAppDetails(appId);

			if (!appDetails.isCompleted) {
				return {
					isCompleted: false,
					message: appDetails.message,
				}
			}

			await s3.putObject(appDetails.results.app_icon_name, appIcon);

			return {
				isCompleted: true,
			}

		} catch (error) {
			return {
				isCompleted: false,
				message: error,
			}
		}
	}

	async updateAppInformation(appId, { app_name, app_link, is_change_icon }, appIcon) {
		try {

			const updateNewAppDetails = await super.query(appSQL.updateAppInformation, [app_name, app_link, appId]);

			if (!updateNewAppDetails.isCompleted) {
				return {
					isCompleted: false,
					message: updateNewAppDetails.message,
				}
			}

			if (is_change_icon === "true") {
				const updateIcon = await this.updateAppIcon(appId, appIcon);

				if (!updateIcon.isCompleted) {
					return {
						isCompleted: false,
						message: updateIcon.message,
					}
				}
			}

			return {
				isCompleted: true,
				message: Message.successUpdate("app")
			}

		} catch (error) {
			return {
				isCompleted: false,
				message: error,
			}
		}
	}

	async updateAppDisplayStatus(appId, { new_status }) {
		try {

			const updateDisplayStatus = await super.query(appSQL.updateAppDisplayStatus, [new_status, appId])
			return {
				isCompleted: updateDisplayStatus.isCompleted,
				message: updateDisplayStatus.isCompleted ? Message.successUpdate("app") : updateDisplayStatus.message,
			}
		} catch (error) {
			return {
				isCompleted: false,
				message: error,
			}
		}
	}

	async deleteApp(appId) {
		try {

			const appDetails = await this.getAppDetails(appId);

			if (!appDetails.isCompleted) {
				return {
					isCompleted: false,
					message: appDetails.message
				}
			}

			const [s3R, deleteApp] = await Promise.all([
				s3.deleteObject(appDetails.results.app_icon_name),
				super.query(appSQL.deleteApp, [appId])
			])

			if (!deleteApp.isCompleted) {
				return {
					isCompleted: false,
					message: deleteApp.message
				}
			}

			return {
				isCompleted: true,
				message: Message.successDelete("app")
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