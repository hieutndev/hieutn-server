const BaseService = require("./BaseService");
const Message = require("../utils/response-message");

const { educationSQL } = require("../utils/sql-query-string")
const { RESPONSE_CODE } = require("../constants/response-code");

class EducationService extends BaseService {
	constructor() {
		super();

	}

	async getAllEducation(options = {}) {
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
			countQuery = educationSQL.countEducationsWithSearch;
			dataQuery = educationSQL.getAllEducationsWithSearch;
			countParams = [searchTerm, searchTerm];
			dataParams = [searchTerm, searchTerm, limit, offset];
		} else {
			// Use non-search queries
			countQuery = educationSQL.countEducationsWithoutSearch;
			dataQuery = educationSQL.getAllEducationsWithoutSearch;
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

	async getEducationById(educationId) {
		const { isCompleted, message, results } = await super.query(educationSQL.getEducationDetails, [educationId]);

		if (!isCompleted) {
			throw message;
		}

		if (results.length === 0) {
			return false;
		}

		return results[0];
	}

	async addNewEducation(title, organization, timeStart, timeEnd) {

		const {
			isCompleted,
			message,
			results
		} = await super.query(educationSQL.addNewEducation, [title, organization, timeStart, timeEnd]);

		if (!isCompleted) {
			throw message;
		}

		return results.insertId

	}

	async updateEducationDetails(eduId, title, organization, timeStart, timeEnd) {


		const {
			isCompleted,
			message
		} = await super.query(educationSQL.updateEducationDetails, [title, organization, timeStart, timeEnd, eduId]);

		if (!isCompleted) {
			throw message;
		}

		return true;


	}

	async softDeleteEducation(educationId) {

		const { isCompleted, message } = await super.query(educationSQL.softDeleteEducation, [educationId]);

		if (!isCompleted) {
			throw message;
		}

		return true


	}

	async permanentDeleteEducation(educationId) {

		const { isCompleted, message } = await super.query(educationSQL.permanentDeleteEducation, [educationId]);

		if (!isCompleted) {
			throw message
		}

		return true

	}

	async recoverEducation(educationId) {

		const { isCompleted, message } = await super.query(educationSQL.recoverEducation, [educationId]);

		if (!isCompleted) {
			throw message
		}

		return true


	}

}

module.exports = new EducationService();