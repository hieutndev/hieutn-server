const BaseController = require("./BaseController")
const AccountService = require("../services/AccountService")
const { RESPONSE_CODE } = require("../constants/response-code");
const REGEX = require("../utils/regex");
const { generateRefreshToken, generateAccessToken } = require("../utils/jwt-helpers");
const { accountSQL } = require("../utils/sql-query-string");


class AccountController extends BaseController {
	constructor() {
		super()
	}

	async signUp(req, res, next) {
		try {

			const { email, username, password, confirmPassword, role } = req.body;

			if (password !== confirmPassword) {
				return super.createResponse(res, 404, RESPONSE_CODE.ERROR.NOT_MATCH.CODE);
			}

			if (!REGEX.PASSWORD.test(password)) {
				return super.createResponse(res, 404, RESPONSE_CODE.ERROR.PASSWORD_NOT_STRONG_ENOUGH.CODE);
			}

			if (username) {
				if (await AccountService.isAccountExist(username, "username")) {
					return super.createResponse(res, 404, RESPONSE_CODE.ERROR.USERNAME_ALREADY_EXIST.CODE);
				}
			}

			if (email) {
				if (await AccountService.isAccountExist(email, "email")) {
					return super.createResponse(res, 404, RESPONSE_CODE.ERROR.EMAIL_ALREADY_EXIST.CODE);
				}
			}

			await AccountService.signUp(username, email, password);

			return super.createResponse(res, 201, RESPONSE_CODE.SUCCESS.SUCCESS_CREATE.CODE)

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async signIn(req, res, next) {
		try {

			const { username, email, password } = req.body

			let accountInfo = null;

			if (username) {
				accountInfo = await AccountService.isAccountExist(username, "username");
			} else {
				accountInfo = await AccountService.isAccountExist(email, "email");
			}

			if (!accountInfo) {
				return super.createResponse(res, 404, username ? RESPONSE_CODE.ERROR.USERNAME_NOT_FOUND.CODE : RESPONSE_CODE.ERROR.EMAIL_NOT_FOUND.CODE)
			}

			if (!await AccountService.comparePassword(password, accountInfo.password)) {
				return super.createResponse(res, 404, RESPONSE_CODE.ERROR.WRONG_PASSWORD.CODE)
			}

			const refreshToken = await generateRefreshToken(accountInfo.user_id);
			const accessToken = await generateAccessToken({
				user_id: accountInfo.user_id,
				role: accountInfo.role
			})

			await AccountService.updateAccountRefreshToken(accountInfo.user_id, refreshToken);

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS.SUCCESS_SIGN_IN.CODE, {
				access_token: accessToken,
				refresh_token: refreshToken,
				user_id: accountInfo.user_id,
				username: accountInfo.username,
				role: accountInfo.role
			})

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async getNewAccessToken(req, res, next) {
		try {
			// const {
			// 	isCompleted,
			// 	message,
			// 	results
			// } = await AccountService.getNewAccessToken(req.user_id, req.refresh_token);
			//
			// if (!isCompleted) {
			// 	return super.createResponse(res, 400, message)
			// }
			//
			// return super.createResponse(res, 200, message, results)

			const accountInfo = await AccountService.isAccountExist(req.user_id, "id");

			if (!accountInfo) {
				return super.createResponse(res, 404, RESPONSE_CODE.ERROR.USER_ID_NOT_FOUND.CODE)
			}

			if (accountInfo.refresh_token !== req.refresh_token) {
				return super.createResponse(res, 404, RESPONSE_CODE.ERROR.WRONG_REFRESH_TOKEN.CODE)
			}

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS.SUCCESS_GET_NEW_ACCESS_TOKEN.CODE, {
				access_token: await generateAccessToken({
					user_id: accountInfo.user_id,
					role: accountInfo.role
				})
			})

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async getAllAccounts(req, res, next) {
		try {

			const listAccounts = await AccountService.getAllAccounts();

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS.SUCCESS_GET_ALL.CODE, listAccounts)

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async updateAccountActiveStatus(req, res, next) {
		try {

			const { accountId } = req.params;

			const { action } = req.body

			if (!["block", "unblock"].includes(action)) {
				return super.createResponse(res, 404, RESPONSE_CODE.ERROR.INVALID_FIELD_VALUE.CODE)
			}

			const accountInfo = await AccountService.isAccountExist(accountId, "id");

			if (!accountInfo) {
				return super.createResponse(res, 404, RESPONSE_CODE.ERROR.USER_ID_NOT_FOUND.CODE)
			}

			if (action === "block" && accountInfo.is_active === 0) {
				return super.createResponse(res, 404, RESPONSE_CODE.ERROR.ALREADY_BLOCKED.CODE)
			}

			if (action === "unblock" && accountInfo.is_active === 1) {
				return super.createResponse(res, 404, RESPONSE_CODE.ERROR.ACCOUNT_NOT_BLOCKED.CODE)
			}

			if (action === "block") {
				await AccountService.blockAccount(accountId)
			} else {
				await AccountService.unBlockAccount(accountId)
			}

			return super.createResponse(res, 200, action === "block" ? RESPONSE_CODE.SUCCESS.SUCCESS_BLOCK.CODE : RESPONSE_CODE.SUCCESS.SUCCESS_UNBLOCK.CODE)

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async checkValidEmail(req, res, next) {
		try {

			const { email } = req.query;

			const accountInfo = await AccountService.isAccountExist(email, "email");

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS.VALID_EMAIL.CODE, {
				isValid: !!accountInfo,
				emailInfo: accountInfo ? {
					email,
					username: accountInfo.username
				} : null
			})

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}
}

module.exports = new AccountController();