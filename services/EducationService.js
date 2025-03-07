const BaseService = require("./BaseService");
const Message = require("../utils/response-message");

const { educationSQL } = require("../utils/sql-query-string")
const { RESPONSE_CODE } = require("../constants/response-code");

class EducationService extends BaseService {
	constructor() {
		super();

	}

	async getAllEducation() {

		const { isCompleted, message, results } = await super.query(educationSQL.getAllEducations)

		if (!isCompleted) {
			throw message
		}

		return results
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