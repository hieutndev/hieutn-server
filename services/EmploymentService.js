const BaseService = require("./BaseService");

const { employmentSQL } = require("../utils/sql-query-string")
const { RESPONSE_CODE } = require("../constants/response-code");

class EmploymentService extends BaseService {
	constructor() {
		super();
	}

	async getListEmployment() {

		const { isCompleted, message, results } = await super.query(employmentSQL.getAllEmployments);

		if (!isCompleted) {
			throw message;
		}

		return results
	}

	async addNewEmployment(title, organization, timeStart, timeEnd) {

		const {
			isCompleted,
			message,
			results
		} = await super.query(employmentSQL.addNewEmployment, [title, organization, timeStart, timeEnd]);

		if (!isCompleted) {
			throw message;
		}

		return results.insertId
	}


	async getEmploymentInfoById(employmentId) {
		const employmentInfo = await super.query(employmentSQL.getEmploymentDetails, [employmentId]);

		if (!employmentInfo.isCompleted) {
			throw new Error(employmentInfo.message);
		}

		if (employmentInfo.results.length === 0) {
			return false;
		}

		return employmentInfo.results[0];
	}

	async updateEmploymentDetails(employmentId, title, organization, timeStart, timeEnd) {

		const {
			isCompleted,
			message,
			results
		} = await super.query(employmentSQL.updateEmployment, [title, organization, timeStart, timeEnd, employmentId]);

		if (!isCompleted) {
			throw message;
		}

		return true
	}

	async permanentDeleteEmployment(employmentId) {


		const { isCompleted, message } = await super.query(employmentSQL.permanentDeleteEmployment, [employmentId]);

		if (!isCompleted) {
			throw message;
		}

		return true


	}

	async softDeleteEmployment(employmentId) {

		const { isCompleted, message } = await super.query(employmentSQL.softDeleteEmployment, [employmentId]);

		if (!isCompleted) {
			throw message
		}

		return true
	}

	async recoverEmployment(employmentId) {
		const { isCompleted, message } = await super.query(employmentSQL.recoverEmployment, [employmentId]);

		if (!isCompleted) {
			throw message;
		}

		return true
	}

}

module.exports = new EmploymentService();