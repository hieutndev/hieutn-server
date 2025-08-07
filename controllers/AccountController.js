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

			const { email, username, password, confirm_password, role, from_admin } = req.body;

			if (from_admin && from_admin !== 1) {
				if (password !== confirm_password) {
					return super.createResponse(res, 404, RESPONSE_CODE.PASSWORD_NOT_MATCH);
				}
			}

			if (!REGEX.PASSWORD.test(password)) {
				return super.createResponse(res, 404, RESPONSE_CODE.PASSWORD_NOT_STRONG_ENOUGH);
			}

			if (username) {
				if (await AccountService.isAccountExist(username, "username")) {
					return super.createResponse(res, 404, RESPONSE_CODE.USERNAME_ALREADY_EXIST);
				}
			}

			if (email) {
				if (await AccountService.isAccountExist(email, "email")) {
					return super.createResponse(res, 404, RESPONSE_CODE.EMAIL_ALREADY_EXIST);
				}
			}

			await AccountService.signUp(username, email, password, role);

			return super.createResponse(res, 201, RESPONSE_CODE.SUCCESS_SIGN_UP)

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
				return super.createResponse(res, 404, username ? RESPONSE_CODE.USERNAME_NOT_FOUND : RESPONSE_CODE.EMAIL_NOT_FOUND)
			}

			if (!await AccountService.comparePassword(password, accountInfo.password)) {
				return super.createResponse(res, 404, RESPONSE_CODE.WRONG_PASSWORD)
			}

			const refreshToken = await generateRefreshToken(accountInfo.user_id);
			const accessToken = await generateAccessToken({
				user_id: accountInfo.user_id,
				role: accountInfo.role
			})

			await AccountService.updateAccountRefreshToken(accountInfo.user_id, refreshToken);

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS_SIGN_IN, {
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

			const accountInfo = await AccountService.isAccountExist(req.user_id, "id");

			if (!accountInfo) {
				return super.createResponse(res, 404, RESPONSE_CODE.USER_ID_NOT_FOUND)
			}

			if (accountInfo.refresh_token !== req.refresh_token) {
				return super.createResponse(res, 404, RESPONSE_CODE.WRONG_REFRESH_TOKEN)
			}

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS_GET_NEW_ACCESS_TOKEN, {
				access_token: await generateAccessToken({
					user_id: accountInfo.user_id,
					role: accountInfo.role,
				}),
				username: accountInfo.username,
				user_id: accountInfo.user_id,
			})

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async getAllAccounts(req, res, next) {
		try {
			const { search, page, limit } = req.query;

			// Parse and validate pagination parameters
			const options = {
				search: search || '',
				page: parseInt(page) || 1,
				limit: parseInt(limit) || 10
			};

			console.log(options.page);


			// Validate page and limit values
			if (options.page < 1) options.page = 1;
			if (options.limit < 1 || options.limit > 100) options.limit = 10;

			const { results, ...metadata } = await AccountService.getAllAccounts(options);

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS_GET_ALL_ACCOUNTS, results, metadata)

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async updateAccountActiveStatus(req, res, next) {
		try {

			const { accountId } = req.params;

			const { action } = req.body

			if (!["block", "unblock"].includes(action)) {
				return super.createResponse(res, 404, RESPONSE_CODE.INVALID_UPDATE_ACTIVE_STATUS_ACTION)
			}

			const accountInfo = await AccountService.isAccountExist(accountId, "id");

			if (!accountInfo) {
				return super.createResponse(res, 404, RESPONSE_CODE.USER_ID_NOT_FOUND)
			}

			if (action === "block" && accountInfo.is_active === 0) {
				return super.createResponse(res, 404, RESPONSE_CODE.ACCOUNT_ALREADY_BLOCKED)
			}

			if (action === "unblock" && accountInfo.is_active === 1) {
				return super.createResponse(res, 404, RESPONSE_CODE.ACCOUNT_NOT_BLOCKED)
			}

			if (action === "block") {
				await AccountService.blockAccount(accountId)
			} else {
				await AccountService.unBlockAccount(accountId)
			}

			return super.createResponse(res, 200, action === "block" ? RESPONSE_CODE.SUCCESS_BLOCK_ACCOUNT : RESPONSE_CODE.SUCCESS_UNBLOCK_ACCOUNT)

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async checkValidEmail(req, res, next) {
		try {

			const { email } = req.query;

			const accountInfo = await AccountService.isAccountExist(email, "email");

			return super.createResponse(res, 200, RESPONSE_CODE.EMAIL_VALID, {
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