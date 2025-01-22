const BaseService = require("./BaseService");

const { employmentSQL } = require("../utils/SQLQueryString")
const Message = require("../utils/ResponseMessage");

class EmploymentService extends BaseService {
	constructor() {
		super();
	}

	async getListEmployment() {
		try {
			const listEmployment = await super.query(employmentSQL.getAllEmployments);

			if (!listEmployment) {
				return {
					isCompleted: false,
					message: listEmployment.message
				}
			}

			return {
				isCompleted: true,
				message: Message.successGetAll("Employment)"),
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
				message: Message.successCreate("employment"),
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

	async getEmploymentDetails(employmentId) {
		try {
			const employmentDetails = await super.query(employmentSQL.getEmploymentDetails, [employmentId]);

			if (!employmentDetails.isCompleted) {
				return {
					isCompleted: false,
					message: employmentDetails.message
				}
			}

			return {
				isCompleted: true,
				message: Message.successGetOne("employment details"),
				results: employmentDetails.results[0]
			}
		} catch (error) {
			return {
				isCompleted: false,
				message: error,
			}
		}
	}

	async updateEmploymentDetails(employmentId, { title, organization, time_start, time_end }) {
		try {

			const updatedEmployment = await super.query(employmentSQL.updateEmployment, [title, organization, time_start, time_end, employmentId]);

			if (!updatedEmployment.isCompleted) {
				return {
					isCompleted: false,
					message: updatedEmployment.message
				}
			}

			return {
				isCompleted: true,
				message: Message.successUpdate("employment"),
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

			const employmentDetails = await this.getEmploymentDetails(employmentId);

			if (!employmentDetails.isCompleted) {
				return {
					isCompleted: false,
					message: employmentDetails.message
				}
			}

			if (!employmentDetails.results.is_deleted) {
				return {
					isCompleted: false,
					message: Message.notInSoftDelete("employment")
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
				message: Message.successDelete("employment"),
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

			const employmentDetails = await this.getEmploymentDetails(employmentId);

			if (!employmentDetails.isCompleted) {
				return {
					isCompleted: false,
					message: employmentDetails.message
				}
			}

			if (employmentDetails.results.is_deleted) {
				return {
					isCompleted: false,
					message: Message.alreadyInSoftDelete("employment")
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
				message: Message.successDelete("employment"),
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

			const employmentDetails = await this.getEmploymentDetails(employmentId);

			if (!employmentDetails.isCompleted) {
				return {
					isCompleted: false,
					message: employmentDetails.message
				}
			}

			if (!employmentDetails.results.is_deleted) {
				return {
					isCompleted: false,
					message: Message.notInSoftDelete("employment")
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
				message: Message.successRecover("employment"),
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