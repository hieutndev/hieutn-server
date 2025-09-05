const { settingSQL } = require("../utils/sql-query-string");
const BaseService = require("./BaseService");




class SettingService extends BaseService {

    constructor() {
        super();
    }

    async getSettings() {
        const { isCompleted, message, results } = await super.query(settingSQL.getSettings);

        if (!isCompleted) {
            throw message;
        }

        const introduce = results.find(item => item.key === 'introduce')?.value || '';
        const animated_quote = results.find(item => item.key === 'animated_quote')?.value || '';

        let skills = JSON.parse(results.find(item => item.key === 'skills')?.value || '[]');


        const response = {
            introduce,
            skills,
            animated_quote
        }

        return response;
    }

    async updateSetting(key, value) {
        const result = await super.query(settingSQL.updateSetting, [value, key]);

        if (!result.isCompleted) {
            throw result.message;
        }

        return true;
    }

    async updateAllSetting(requestBody) {
        const keys = Object.keys(requestBody);
        for (const key of keys) {
            const value = requestBody[key];
            const result = await super.query(settingSQL.updateSetting, [value, key]);
            if (!result.isCompleted) {
                throw result.message;
            }
        }

        return true;
    }

}

module.exports = new SettingService();