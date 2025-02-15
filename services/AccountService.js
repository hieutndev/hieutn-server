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
		this.signUpByEmail = this.signUpByEmail.bind(this);
		this.signUpByUsername = this.signUpByUsername.bind(this);
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

	async getAccountByUsername(username) {
		try {
			console.log('call');
			const account = await super.query(accountSQL.getAccountByUsername, [username])

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

	async hasAccount(searchValue, searchBy) {

		if (!["email", "id"].includes(searchBy)) {
			throw new Error("searchBy must be either 'email' or 'id'")
		}

		try {

			const account = searchBy === "email" ? await this.getAccountByEmail(searchValue) : await this.getAccountByUserId(searchValue);

			if (!account.isCompleted) {
				return {
					isCompleted: false,
					message: account.message
				}
			}

			if (account.results.length === 0) {
				return {
					isCompleted: false,
					message: searchBy === "email" ? Message.emailNotFound : Message.userIdNotFound
				}
			}

			return {
				isCompleted: true,
				results: account.results[0]
			}

		} catch (error) {
			return {
				isCompleted: false,
				message: error,
			}
		}

	}

	async hashPassword(password) {
		return await bcrypt.hash(password, Number(process.env.PWD_SECRET));
	}

	async comparePassword(inputPassword, hashedPassword) {
		return await bcrypt.compare(inputPassword, hashedPassword)
	}

	async signUpByEmail({ email, password, confirm_password }) {
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

	async signUpByUsername({ username, password, confirm_password }) {
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

			console.log(this);
			const accountWithUsername = await this.getAccountByUsername(username)

			if (!accountWithUsername.isCompleted) {
				return {
					isCompleted: false,
					message: accountWithUsername.message,
				}
			}

			if (accountWithUsername.results.length > 0) {
				return {
					isCompleted: false,
					message: Message.usernameAlreadyExist,
				}
			}

			const signUp = await super.query(accountSQL.signUp, [username, null, await this.hashPassword(password)])

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

	async signIn({ username, email, password }) {
		try {
			let accountDetails;
			if (username) {
				accountDetails = await this.getAccountByUsername(username);
			} else {
				accountDetails = await this.getAccountByEmail(email);
			}

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
					user_id: accountDetails.results[0].user_id,
					username: accountDetails.results[0].username,
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

	async getListAccounts() {
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

	async blockAccount(userId) {
		try {

			const accountStatus = await this.hasAccount(userId, "id");

			if (!accountStatus.isCompleted) {
				return {
					isCompleted: false,
					message: accountStatus.message,
				}
			}

			if (accountStatus.results.is_active === 0) {
				return {
					isCompleted: false,
					message: Message.alreadyBlocked,
				}
			}

			const blockAccount = await super.query(accountSQL.blockAccount, [userId]);

			if (!blockAccount.isCompleted) {
				return {
					isCompleted: false,
					message: blockAccount.message,
				}
			}

			return {
				isCompleted: true,
				message: Message.successBlock
			}
		} catch (error) {
			return {
				isCompleted: false,
			}
		}
	}

	async unBlockAccount(userId) {
		try {
			const accountStatus = await this.hasAccount(userId, "id");

			if (!accountStatus.isCompleted) {
				return {
					isCompleted: false,
					message: accountStatus.message,
				}
			}

			if (accountStatus.results.is_active === 1) {
				return {
					isCompleted: false,
					message: Message.accountNotBlocked,
				}
			}

			const unBlockAccount = await super.query(accountSQL.unBlockAccount, [userId]);

			if (!unBlockAccount.isCompleted) {
				return {
					isCompleted: false,
					message: unBlockAccount.message,
				}
			}

			return {
				isCompleted: true,
				message: Message.successUnblock
			}

		} catch (error) {
			return {
				isCompleted: false,
			}
		}
	}

	async updateAccountStatus(accountId, action) {
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
}

module.exports = new AccountService()