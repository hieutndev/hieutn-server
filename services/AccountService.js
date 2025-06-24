const BaseService = require('./BaseService');
const Message = require("../utils/response-message");
const { accountSQL } = require("../utils/sql-query-string");
const randomString = require("../utils/generate-unique-string");
const bcrypt = require("bcrypt");
const { RESPONSE_CODE } = require("../constants/response-code")


const REGEX = require("../utils/regex");
const { generateAccessToken, generateRefreshToken } = require("../utils/jwt-helpers");

class AccountService extends BaseService {
	constructor() {
		super();
	}

	async blockAccount(userId) {

		const { isCompleted, message, results } = await super.query(accountSQL.blockAccount, [userId]);

		if (!isCompleted) {
			throw message
		}

		return true

	}

	async unBlockAccount(userId) {


		const { isCompleted, message, results } = await super.query(accountSQL.unBlockAccount, [userId]);

		if (!isCompleted) {
			throw message
		}

		return true
	}

	async getAccountByEmail(email) {
		const queryAccountByEmail = await super.query(accountSQL.getAccountByEmail, [email])

		if (!queryAccountByEmail.isCompleted) {
			return [];
		}

		return queryAccountByEmail.results
	}

	async getAccountByUsername(username) {

		const queryAccountByUsername = await super.query(accountSQL.getAccountByUsername, [username])

		if (!queryAccountByUsername.isCompleted) {
			return [];
		}

		return queryAccountByUsername.results

	}

	async getAccountByUserId(userId) {

		const queryAccountById = await super.query(accountSQL.getAccountById, [userId])

		if (!queryAccountById.isCompleted) {
			return [];
		}

		return queryAccountById.results

	}

	async isAccountExist(searchValue, searchBy) {

		if (!["email", "id", "username"].includes(searchBy)) {
			throw RESPONSE_CODE.INVALID_SEARCH_TYPE_VALUE
		}

		try {
			let queryAccount;
			if (searchBy === "email") {
				queryAccount = await this.getAccountByEmail(searchValue)
			}

			if (searchBy === "id") {
				queryAccount = await this.getAccountByUserId(searchValue);
			}

			if (searchBy === "username") {
				queryAccount = await this.getAccountByUsername(searchValue);
			}

			if (queryAccount.length === 0) {
				return false
			}

			return queryAccount[0]
		} catch (error) {
			throw error
		}

	}

	async hashPassword(password) {
		return await bcrypt.hash(password, Number(process.env.PWD_SECRET));
	}

	async comparePassword(inputPassword, hashedPassword) {

		return !!(await bcrypt.compare(inputPassword, hashedPassword));
	}

	async signUp(username, email, password) {
		const {
			isCompleted,
			message,
			results
		} = await super.query(accountSQL.signUp, [username || randomString(10), email || null, await this.hashPassword(password)])

		if (!isCompleted) {
			throw message
		}

		return results.insertId
	}

	async updateAccountRefreshToken(userId, newRefreshToken) {
		const {
			isCompleted,
			message,
			results
		} = await super.query(accountSQL.updateNewRefreshToken, [newRefreshToken, userId])

		if (!isCompleted) {
			throw message
		}

		return true;
	}

	async getAllAccounts() {

		const { isCompleted, message, results } = await super.query(accountSQL.getListAccounts);

		if (!isCompleted) {
			throw message
		}

		return results
	}

}

module.exports = new AccountService()