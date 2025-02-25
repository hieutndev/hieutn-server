const BaseService = require("./BaseService");
const Message = require("../utils/response-message");

const { educationSQL } = require("../utils/sql-query-string")
const { RESPONSE_CODE } = require("../constants/response-code");

class EducationService extends BaseService {
	constructor() {
		super();

	}

	async getAllEducation() {
		try {

			const listEducation = await super.query(educationSQL.getAllEducations)

			if (!listEducation.isCompleted) {
				return {
					isCompleted: false,
					message: listEducation.message,
				}
			}

			return {
				isCompleted: true,
				message: Message.successGetAll("education"),
				results: listEducation.results,
			}


		} catch (error) {
			return {
				isCompleted: false,
				message: error,
			}
		}
	}

	async getEducationById(educationId) {
		const educationDetails = await super.query(educationSQL.getEducationDetails, [educationId]);

		if (!educationDetails.isCompleted) {
			throw new Error(educationDetails.message);
		}

		if (educationDetails.results.length === 0) {
			return false;
		}

		return educationDetails.results[0];
	}

	async getEducationDetails(educationId) {
		try {

			const educationInfo = await this.getEducationById(educationId);

			if (!educationInfo) {
				return {
					isCompleted: false,
					message: RESPONSE_CODE.ERROR.NOT_FOUND.CODE,
				}
			}

			return {
				isCompleted: true,
				message: RESPONSE_CODE.SUCCESS.SUCCESS_GET_ONE.CODE,
				results: educationInfo
			}

		} catch (error) {
			return {
				isCompleted: false,
				message: error,
			}
		}
	}

	async addNewEducation({ title, organization, time_start, time_end }) {
		try {
			const addNewEducationStatus = await super.query(educationSQL.addNewEducation, [title, organization, time_start, time_end]);

			if (!addNewEducationStatus.isCompleted) {
				return {
					isCompleted: false,
					message: addNewEducationStatus.message,
				}
			}

			return {
				isCompleted: true,
				message: RESPONSE_CODE.SUCCESS.SUCCESS_CREATE.CODE,
				results: {
					newEducationId: addNewEducationStatus.results.insertId
				}
			}
		} catch (error) {
			return {
				isCompleted: false,
				message: error,
			}
		}
	}

	async updateEducationDetails(edu_id, { title, organization, time_start, time_end }) {
		try {

			const updateStatus = await super.query(educationSQL.updateEducationDetails, [title, organization, time_start, time_end, edu_id]);

			if (!updateStatus.isCompleted) {
				return ({
					isCompleted: false,
					message: updateStatus.message,
				})
			}

			return ({
				isCompleted: true,
				message: RESPONSE_CODE.SUCCESS.SUCCESS_UPDATE.CODE,
			})


		} catch (error) {
			return {
				isCompleted: false,
				message: error,
			}
		}
	}

	async softDeleteEducation(educationId) {
		try {

			const educationInfo = await this.getEducationById(educationId);

			if (!educationInfo) {
				return {
					isCompleted: false,
					message: RESPONSE_CODE.ERROR.NOT_FOUND.CODE,
				}
			}

			if (educationInfo.is_deleted) {
				return {
					isCompleted: false,
					message: RESPONSE_CODE.ERROR.ALREADY_IN_SOFT_DELETE.CODE,
				}
			}

			const softDeleteStatus = await super.query(educationSQL.softDeleteEducation, [educationId]);

			if (!softDeleteStatus.isCompleted) {
				return {
					isCompleted: false,
					message: softDeleteStatus.message,
				}
			}

			return {
				isCompleted: true,
				message: RESPONSE_CODE.SUCCESS.SUCCESS_DELETE.CODE,
			}

		} catch (error) {
			return {
				isCompleted: false,
				message: error,
			}
		}
	}

	async permanentDeleteEducation(educationId) {
		try {

			const educationDetails = await this.getEducationById(educationId);

			if (!educationDetails) {
				return {
					isCompleted: false,
					message: RESPONSE_CODE.ERROR.NOT_FOUND.CODE,
				}
			}

			if (!educationDetails.is_deleted) {
				return {
					isCompleted: false,
					message: RESPONSE_CODE.ERROR.NOT_IN_SOFT_DELETE.CODE,
				}
			}

			const deleteStatus = await super.query(educationSQL.permanentDeleteEducation, [educationId]);

			if (!deleteStatus.isCompleted) {
				return {
					isCompleted: false,
					message: deleteStatus.message,
				}
			}

			return {
				isCompleted: true,
				message: RESPONSE_CODE.SUCCESS.SUCCESS_DELETE.CODE,
			}

		} catch (error) {
			return {
				isCompleted: false,
				message: error,
			}
		}
	}

	async recoverEducation(educationId) {
		try {

			const educationDetails = await this.getEducationById(educationId);

			if (!educationDetails) {
				return {
					isCompleted: false,
					message: RESPONSE_CODE.ERROR.NOT_FOUND.CODE,
				}
			}

			if (!educationDetails.is_deleted) {
				return {
					isCompleted: false,
					message: RESPONSE_CODE.ERROR.NOT_IN_SOFT_DELETE.CODE,
				}
			}

			const recoverStatus = await super.query(educationSQL.recoverEducation, [educationId]);

			if (!recoverStatus.isCompleted) {
				return {
					isCompleted: false,
					message: recoverStatus.message,
				}
			}

			return {
				isCompleted: true,
				message: RESPONSE_CODE.SUCCESS.SUCCESS_RECOVER.CODE,
			}

		} catch (error) {
			return {
				isCompleted: false,
				message: error,
			}
		}
	}

}

module.exports = new EducationService();