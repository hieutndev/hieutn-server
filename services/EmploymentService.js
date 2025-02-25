const BaseService = require("./BaseService");

const { employmentSQL } = require("../utils/sql-query-string")
const Message = require("../utils/response-message");
const { RESPONSE_CODE } = require("../constants/response-code");

class EmploymentService extends BaseService {
	constructor() {
		super();
	}

	async getListEmployment() {
		try {
			const listEmployment = await super.query(employmentSQL.getAllEmployments);

			if (!listEmployment.isCompleted) {
				return {
					isCompleted: false,
					message: listEmployment.message
				}
			}

			return {
				isCompleted: true,
				message: RESPONSE_CODE.SUCCESS.SUCCESS_GET_ALL.CODE,
				results: listEmployment.results
			}

		} catch (error) {
			return {
				isCompleted: false,
				message: error,
			}
		}
	}

	async addNewEmployment({ title, organization, time_start, time_end }) {
		try {

			const newEmployment = await super.query(employmentSQL.addNewEmployment, [title, organization, time_start, time_end]);

			if (!newEmployment.isCompleted) {
				return {
					isCompleted: false,
					message: newEmployment.message
				}
			}

			return {
				isCompleted: true,
				message: RESPONSE_CODE.SUCCESS.SUCCESS_CREATE.CODE,
				results: {
					newEmploymentId: newEmployment.results.insertId
				}
			}

		} catch (error) {
			return {
				isCompleted: false,
				message: error,
			}
		}
	}


	async getEmploymentInfoById(employmentId) {
		const employmentInfo = await super.query(employmentSQL.getEmploymentInfoById, [employmentId]);

		if (!employmentInfo.isCompleted) {
			throw new Error(employmentInfo.message);
		}

		if (employmentInfo.results.length === 0) {
			return false;
		}

		return employmentInfo.results[0];
	}

	async getEmploymentDetails(employmentId) {
		try {
			const employmentDetails = await this.getEmploymentInfoById(employmentId);

			if (!employmentDetails) {
				return {
					isCompleted: false,
					message: RESPONSE_CODE.ERROR.NOT_FOUND.CODE
				}
			}

			return {
				isCompleted: true,
				message: RESPONSE_CODE.SUCCESS.SUCCESS_GET_ONE.CODE,
				results: employmentDetails
			}
		} catch (error) {
			return {
				isCompleted: false,
				message: error,
			}
		}
	}

	async updateEmploymentDetails(employment_id, { title, organization, time_start, time_end }) {
		try {

			const updatedEmployment = await super.query(employmentSQL.updateEmployment, [title, organization, time_start, time_end, employment_id]);

			if (!updatedEmployment.isCompleted) {
				return {
					isCompleted: false,
					message: updatedEmployment.message
				}
			}

			return {
				isCompleted: true,
				message: RESPONSE_CODE.SUCCESS.SUCCESS_UPDATE.CODE,
			}

		} catch (error) {
			return {
				isCompleted: false,
				message: error,
			}
		}
	}

	async permanentDeleteEmployment(employmentId) {
		try {

			const employmentDetails = await this.getEmploymentInfoById(employmentId);

			if (!employmentDetails) {
				return {
					isCompleted: false,
					message: RESPONSE_CODE.ERROR.NOT_FOUND.CODE
				}
			}

			if (!employmentDetails.is_deleted) {
				return {
					isCompleted: false,
					message: RESPONSE_CODE.ERROR.NOT_IN_SOFT_DELETE.CODE
				}
			}

			const permanentDeleteEmployment = await super.query(employmentSQL.permanentDeleteEmployment, [employmentId]);

			if (!permanentDeleteEmployment.isCompleted) {
				return {
					isCompleted: false,
					message: permanentDeleteEmployment.message
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

	async softDeleteEmployment(employmentId) {
		try {

			const employmentDetails = await this.getEmploymentInfoById(employmentId);

			if (!employmentDetails) {
				return {
					isCompleted: false,
					message: RESPONSE_CODE.ERROR.NOT_FOUND.CODE
				}
			}

			if (employmentDetails.is_deleted) {
				return {
					isCompleted: false,
					message: RESPONSE_CODE.ERROR.ALREADY_IN_SOFT_DELETE.CODE
				}
			}

			const softDeleteEmployment = await super.query(employmentSQL.softDeleteEmployment, [employmentId]);

			if (!softDeleteEmployment.isCompleted) {
				return {
					isCompleted: false,
					message: softDeleteEmployment.message
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

	async recoverEmployment(employmentId) {
		try {

			const employmentDetails = await this.getEmploymentInfoById(employmentId);

			if (!employmentDetails) {
				return {
					isCompleted: false,
					message: RESPONSE_CODE.ERROR.NOT_FOUND.CODE
				}
			}

			if (!employmentDetails.is_deleted) {
				return {
					isCompleted: false,
					message: RESPONSE_CODE.ERROR.NOT_IN_SOFT_DELETE.CODE
				}
			}

			const recoverEmployment = await super.query(employmentSQL.recoverEmployment, [employmentId]);

			if (!recoverEmployment.isCompleted) {
				return {
					isCompleted: false,
					message: recoverEmployment.message
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

module.exports = new EmploymentService();