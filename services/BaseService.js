const mySLQ = require("../config/mysql");

class BaseService {
	constructor() {
	}

	async query(sqlString, values) {
		return await mySLQ.query(sqlString, values);
	};

	async queryMany(sqlString, values) {
		return await mySLQ.queryMany(sqlString, values);
	};
}

module.exports = BaseService;