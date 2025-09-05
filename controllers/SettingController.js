const SettingService = require("../services/SettingService");
const BaseController = require("./BaseController");
const { RESPONSE_CODE } = require("../constants/response-code");

class SettingController extends BaseController {
    constructor() {
        super();
    }

    async getSettings(req, res) {
        try {
            const settings = await SettingService.getSettings();

            return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS_GET_SETTINGS, settings);
        }
        catch (error) {
            return super.createResponse(res, 500, error.message);
        }
    }
    async updateSetting(req, res) {
        try {
            const { key, value } = req.body

            if (!key || !value) {
                return super.createResponse(res, 404, RESPONSE_CODE.MISSING_REQUIRED_FIELDS);
            }

            await SettingService.updateSetting(key, value);

            return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS_UPDATE_SETTING);

        }
        catch (error) {
            return super.createResponse(res, 500, error.message);
        }
    }

    async updateAllSetting(req, res) {
        try {
            const settings = req.body;

            await SettingService.updateAllSetting(settings);

            return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS_UPDATE_SETTING);

        }
        catch (error) {
            return super.createResponse(res, 500, error.message);
        }
    }
}

module.exports = new SettingController();