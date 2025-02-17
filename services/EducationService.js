const BaseService = require("./BaseService");
const Message = require("../utils/ResponseMessage");

const { educationSQL } = require("../utils/SQLQueryString")

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

	async getEducationDetails(educationId) {
		try {

			const getEducationDetails = await super.query(educationSQL.getEducationDetails, [educationId]);

			if (!getEducationDetails.isCompleted) {
				return {
					isCompleted: false,
					message: getEducationDetails.message
				}
			}

			return {
				isCompleted: true,
				message: Message.successGetOne("education"),
				results: getEducationDetails.results[0]
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
				message: Message.successCreate("education"),
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

	async updateEducationDetails(educationId, { title, organization, time_start, time_end }) {
		try {

			const updateStatus = await super.query(educationSQL.updateEducationDetails, [title, organization, time_start, time_end, educationId]);

			if (!updateStatus.isCompleted) {
				return ({
					isCompleted: false,
					message: updateStatus.message,
				})
			}

			return ({
				isCompleted: true,
				message: Message.successUpdate("education"),
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

			const educationDetails = await this.getEducationDetails(educationId);

			if (!educationDetails.isCompleted) {
				return {
					isCompleted: false,
					message: educationDetails.message,
				}
			}

			if (educationDetails.results.is_deleted) {
				return {
					isCompleted: false,
					message: Message.alreadyInSoftDelete("This education information"),
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
				message: Message.successDelete("Education information"),
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

			const educationDetails = await this.getEducationDetails(educationId);

			if (!educationDetails.isCompleted) {
				return {
					isCompleted: false,
					message: educationDetails.message,
				}
			}

			if (!educationDetails.results.is_deleted) {
				return {
					isCompleted: false,
					message: Message.notInSoftDelete("This education information"),
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
				message: Message.successDelete("Education information"),
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

			const educationDetails = await this.getEducationDetails(educationId);

			if (!educationDetails.isCompleted) {
				return {
					isCompleted: false,
					message: educationDetails.message,
				}
			}

			if (!educationDetails.results.is_deleted) {
				return {
					isCompleted: false,
					message: Message.notInSoftDelete("This education information"),
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
				message: Message.successUpdate("Education information")
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