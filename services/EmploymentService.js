const BaseService = require("./BaseService");

const { employmentSQL } = require("../utils/sql-query-string")
const { RESPONSE_CODE } = require("../constants/response-code");

class EmploymentService extends BaseService {
	constructor() {
		super();
	}

	async getListEmployment(options = {}) {
		const {
			search = '',
			page = 1,
			limit = 10
		} = options;

		// Calculate offset for pagination
		const offset = (page - 1) * limit;

		let countQuery, dataQuery, countParams, dataParams;

		if (search && search.trim()) {
			const searchTerm = `%${search.trim()}%`;

			// Use search queries
			countQuery = employmentSQL.countEmploymentsWithSearch;
			dataQuery = employmentSQL.getAllEmploymentsWithSearch;
			countParams = [searchTerm, searchTerm];
			dataParams = [searchTerm, searchTerm, limit, offset];
		} else {
			// Use non-search queries
			countQuery = employmentSQL.countEmploymentsWithoutSearch;
			dataQuery = employmentSQL.getAllEmploymentsWithoutSearch;
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

		return {
			results,
			totalCount,
			page,
			limit,
			totalPages: Math.ceil(totalCount / limit)
		};
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
		} = await super.query(employmentSQL.updateEmployment, [title, organization, timeStart, timeEnd ?? null, employmentId]);

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