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
		const accountInfo = await this.isAccountExist(userId, "id");

		if (!accountInfo) {
			throw new Error(RESPONSE_CODE.ERROR.USER_ID_NOT_FOUND.CODE);
		}

		if (accountInfo.is_active === 0) {
			throw new Error(RESPONSE_CODE.ERROR.ALREADY_BLOCKED.CODE);
		}

		const blockAccount = await super.query(accountSQL.blockAccount, [userId]);

		if (!blockAccount.isCompleted) {
			throw new Error(blockAccount.message);
		}

		return {
			isCompleted: true,
			message: RESPONSE_CODE.SUCCESS.SUCCESS_BLOCK.CODE,
		}

	}

	async unBlockAccount(userId) {

		const accountStatus = await this.isAccountExist(userId, "id");

		if (!accountStatus) {
			throw new Error(RESPONSE_CODE.ERROR.USER_ID_NOT_FOUND.CODE)
		}

		if (accountStatus.is_active === 1) {
			throw new Error(RESPONSE_CODE.ERROR.ACCOUNT_NOT_BLOCKED.CODE)
		}

		const unblockStatus = await super.query(accountSQL.unBlockAccount, [userId]);

		if (!unblockStatus.isCompleted) {
			throw new Error(unblockStatus.message)
		}

		return {
			isCompleted: true,
			message: RESPONSE_CODE.SUCCESS.SUCCESS_UNBLOCK.CODE,
		}
	}

	async getAccountByEmail(email) {
		const queryAccountByEmail = await super.query(accountSQL.getAccountByEmail, [email])

		if (!queryAccountByEmail.isCompleted) {
			throw new Error(RESPONSE_CODE.ERROR.EMAIL_NOT_FOUND.CODE)
		}

		return queryAccountByEmail.results
	}

	async getAccountByUsername(username) {

		const queryAccountByUsername = await super.query(accountSQL.getAccountByUsername, [username])

		if (!queryAccountByUsername.isCompleted) {
			throw new Error(RESPONSE_CODE.ERROR.USERNAME_NOT_FOUND.CODE)
		}

		return queryAccountByUsername.results

	}

	async getAccountByUserId(userId) {

		const queryAccountById = await super.query(accountSQL.getAccountById, [userId])

		if (!queryAccountById.isCompleted) {
			throw new Error(RESPONSE_CODE.ERROR.USER_ID_NOT_FOUND.CODE)
		}

		return queryAccountById.results

	}

	async isAccountExist(searchValue, searchBy) {

		if (!["email", "id", "username"].includes(searchBy)) {
			throw new Error("searchBy must be either 'email', 'id' or 'username'");
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

		if (await bcrypt.compare(inputPassword, hashedPassword)) {
			return true;
		} else {
			throw new Error(RESPONSE_CODE.ERROR.WRONG_PASSWORD.CODE)
		}
	}

	async signUp({ username, email, password, confirm_password }) {
		try {

			if (password !== confirm_password) {
				return {
					isCompleted: false,
					message: RESPONSE_CODE.ERROR.PASSWORD_NOT_MATCH.CODE,
				}
			}

			if (!REGEX.PASSWORD.test(password)) {
				return {
					isCompleted: false,
					message: RESPONSE_CODE.ERROR.PASSWORD_NOT_STRONG_ENOUGH.CODE,
				}
			}


			if (username) {
				if (await this.isAccountExist(username, "username")) {
					return {
						isCompleted: false,
						message: RESPONSE_CODE.ERROR.USERNAME_ALREADY_EXIST.CODE,
					}
				}
			}

			if (email) {
				if (await this.isAccountExist(email, "email")) {
					return {
						isCompleted: false,
						message: RESPONSE_CODE.ERROR.EMAIL_ALREADY_EXIST.CODE,
					}
				}
			}

			const signUp = await super.query(accountSQL.signUp, [username || randomString(10), email || null, await this.hashPassword(password)])

			if (!signUp.isCompleted) {
				return {
					isCompleted: false,
					message: signUp.message,
				}
			}

			return {
				isCompleted: true,
				message: RESPONSE_CODE.SUCCESS.SUCCESS_SIGN_UP.CODE,
			}

		} catch (error) {
			return {
				isCompleted: false,
				message: error,
			}
		}
	}

	async signIn({ username, email, password }) {
		try {
			let accountInfo;

			if (username) {
				accountInfo = await this.isAccountExist(username, "username");
			} else {
				accountInfo = await this.isAccountExist(email, "email");
			}

			if (!accountInfo) {
				return {
					isCompleted: false,
					message: username ? RESPONSE_CODE.ERROR.USERNAME_NOT_FOUND.CODE : RESPONSE_CODE.ERROR.EMAIL_NOT_FOUND.CODE,
				}
			}

			if (await this.comparePassword(password, accountInfo.password)) {
				const refreshToken = await generateRefreshToken(accountInfo.user_id);
				const accessToken = await generateAccessToken({
					user_id: accountInfo.user_id,
					role: accountInfo.role
				})

				const updateRefreshToken = await super.query(accountSQL.updateNewRefreshToken, [refreshToken, accountInfo.user_id]);

				if (!updateRefreshToken.isCompleted) {
					return {
						isCompleted: false,
						message: updateRefreshToken.message,
					}
				}

				return {
					isCompleted: true,
					message: RESPONSE_CODE.SUCCESS.SUCCESS_SIGN_IN.CODE,
					results: {
						access_token: accessToken,
						refresh_token: refreshToken,
						user_id: accountInfo.user_id,
						username: accountInfo.username,
						role: accountInfo.role,
					}
				}
			}

		} catch (error) {
			return {
				isCompleted: false,
				message: error,
			}
		}
	}

	async getNewAccessToken(userId, refreshToken) {
		try {

			const accountInfo = await this.isAccountExist(userId, "id");

			if (!accountInfo) {
				return {
					isCompleted: false,
					message: RESPONSE_CODE.ERROR.USER_ID_NOT_FOUND.CODE,
				}
			}

			if (accountInfo.refresh_token !== refreshToken) {
				return {
					isCompleted: false,
					message: RESPONSE_CODE.ERROR.WRONG_REFRESH_TOKEN.CODE,
				}
			}

			return {
				isCompleted: true,
				message: RESPONSE_CODE.SUCCESS.SUCCESS_GET_NEW_ACCESS_TOKEN.CODE,
				results: {
					access_token: await generateAccessToken({
						user_id: accountInfo.user_id,
						role: accountInfo.role
					})
				}
			}

		} catch (error) {
			return {
				isCompleted: false,
				message: error,
			}
		}
	}

	async getAllAccounts() {
		try {

			const listAccounts = await super.query(accountSQL.getListAccounts);

			if (!listAccounts.isCompleted) {
				return {
					isCompleted: false,
					message: listAccounts.message,
				}
			}

			return {
				isCompleted: true,
				results: listAccounts.results,
			}

		} catch (error) {
			return {
				isCompleted: false,
				message: error
			}
		}
	}

	async updateAccountActiveStatus(accountId, action) {
		try {

			if (!["block", "unblock"].includes(action)) {
				return {
					isCompleted: false,
					message: "'action' must be either 'block' or 'unblock'",
				}
			}

			if (action === "block") {
				return await this.blockAccount(accountId)
			} else {
				return await this.unBlockAccount(accountId)
			}

		} catch (error) {
			return {
				isCompleted: false,
				message: error,
			}
		}
	}

	async checkValidEmail(email) {
		try {
			const emailInfo = await this.isAccountExist(email, "email");

			return {
				isCompleted: true,
				message: emailInfo ? RESPONSE_CODE.SUCCESS.VALID_EMAIL.CODE : RESPONSE_CODE.ERROR.EMAIL_NOT_FOUND.CODE,
				results: {
					isValid: emailInfo ? true : false,
					emailInfo: emailInfo ? {
						email,
						username: emailInfo.username
					} : null
				}
			}
		} catch (error) {
			return {
				isCompleted: false,
				message: error,
			}
		}
	}

}

module.exports = new AccountService()