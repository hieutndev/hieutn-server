const BaseService = require('./BaseService');
const Message = require("../utils/ResponseMessage");
const { accountSQL } = require("../utils/SQLQueryString");
const randomString = require("../utils/generate-unique-string");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");


const REGEX = require("../utils/regex");
const { generateAccessToken, generateRefreshToken } = require("../utils/jwt-helpers");

class AccountService extends BaseService {
	constructor() {
		super();
	}

	async getAccountByEmail(email) {
		try {
			const account = await super.query(accountSQL.getAccountByEmail, [email])

			if (!account.isCompleted) {
				return {
					isCompleted: false,
					message: account.message,
				}
			}

			return {
				isCompleted: true,
				results: account.results,
			}

		} catch (error) {
			throw error
		}
	}

	async getAccountByUserId(userId) {
		try {
			const account = await super.query(accountSQL.getAccountById, [userId])

			if (!account.isCompleted) {
				return {
					isCompleted: false,
					message: account.message,
				}
			}

			return {
				isCompleted: true,
				results: account.results,
			}

		} catch (error) {
			throw error
		}
	}

	async hashPassword(password) {
		return await bcrypt.hash(password, Number(process.env.PWD_SECRET));
	}

	async comparePassword(inputPassword, hashedPassword) {
		return await bcrypt.compare(inputPassword, hashedPassword)
	}

	async signUp({ email, password, confirm_password }) {
		try {

			if (password !== confirm_password) {
				return {
					isCompleted: false,
					message: Message.notMatch("Password", "Confirm password"),
				}
			}

			if (!REGEX.PASSWORD.test(password)) {
				return {
					isCompleted: false,
					message: Message.passwordNotStrongEnough,
				}
			}

			const accountWithEmail = await this.getAccountByEmail(email)
			if (!accountWithEmail.isCompleted) {
				return {
					isCompleted: false,
					message: accountWithEmail.message,
				}
			}

			console.log(accountWithEmail.results)

			if (accountWithEmail.results.length > 0) {
				return {
					isCompleted: false,
					message: Message.emailAlreadyExist,
				}
			}

			const signUp = await super.query(accountSQL.signUp, [randomString(10), email, await this.hashPassword(password)])

			if (!signUp.isCompleted) {
				return {
					isCompleted: false,
					message: signUp.message,
				}
			}

			return {
				isCompleted: true,
				message: Message.signUpSuccess,
			}


		} catch (error) {
			return {
				isCompleted: false,
				message: error,
			}
		}
	}

	async signIn({ email, password }) {
		try {

			const accountDetails = await this.getAccountByEmail(email);

			if (!accountDetails.isCompleted) {
				return {
					isCompleted: false,
					message: accountDetails.message,
				}
			}

			if (accountDetails.results.length === 0) {
				return {
					isCompleted: false,
					message: Message.emailNotFound,
				}
			}

			const isPasswordMatch = await this.comparePassword(password, accountDetails.results[0].password);

			if (!isPasswordMatch) {
				return {
					isCompleted: false,
					message: Message.passwordNotMatch,
				}
			}

			const refreshToken = await generateRefreshToken(accountDetails.results[0].user_id);
			const accessToken = await generateAccessToken({
				user_id: accountDetails.results[0].user_id,
				role: accountDetails.results[0].role
			})

			const updateRefreshToken = await super.query(accountSQL.updateNewRefreshToken, [refreshToken, accountDetails.results[0].user_id]);

			if (!updateRefreshToken.isCompleted) {
				return {
					isCompleted: false,
					message: updateRefreshToken.message,
				}
			}

			return {
				isCompleted: true,
				message: Message.signInSuccess,
				results: {
					access_token: accessToken,
					refresh_token: refreshToken,
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

			const accountDetails = await this.getAccountByUserId(userId);

			if (!accountDetails.isCompleted) {
				return {
					isCompleted: false,
					message: accountDetails.message,
				}
			}

			if (accountDetails.results.length === 0) {
				return {
					isCompleted: false,
					message: Message.userIdNotFound,
				}
			}

			if (accountDetails.results[0].refresh_token !== refreshToken) {
				return {
					isCompleted: false,
					message: Message.wrongRefreshToken,
				}
			}

			// const newRefreshToken


			return {
				isCompleted: true,
				message: Message.successGetNewAccessToken,
				results: {
					access_token: await generateAccessToken({
						user_id: accountDetails.results[0].user_id,
						role: accountDetails.results[0].role
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


}

module.exports = new AccountService()