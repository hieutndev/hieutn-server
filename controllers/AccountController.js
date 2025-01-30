const BaseController = require("./BaseController")
const AccountService = require("../services/AccountService")


class AccountController extends BaseController {
	constructor() {
		super()
	}

	async signUp(req, res, next) {
		try {

			const { isCompleted, message } = await AccountService.signUp(req.body)

			if (!isCompleted) {
				return next({
					status: 400,
					message
				})
			}

			return super.createSuccessResponse(res, 201, message)

		} catch (error) {
			return next({
				status: 500,
				error
			})
		}
	}

	async signIn(req, res, next) {
		try {

			const { isCompleted, message, results } = await AccountService.signIn(req.body);

			if (!isCompleted) {
				return next({
					status: 400,
					message
				})
			}

			return super.createSuccessResponse(res, 200, message, results)

		} catch (error) {
			return next({
				status: 500,
				error
			})
		}
	}

	async getNewAccessToken(req, res, next) {
		try {

			const {
				isCompleted,
				message,
				results
			} = await AccountService.getNewAccessToken(req.user_id, req.refresh_token);

			if (!isCompleted) {
				return next({
					status: 400,
					message
				})
			}

			return super.createSuccessResponse(res, 200, message, results)

		} catch (error) {
			return next({
				status: 500,
				error
			})
		}
	}

	async getAllUsers(req, res, next) {
		try {

			const { isCompleted, message, results } = await AccountService.getListAccounts();

			if (!isCompleted) {
				return next({
					status: 400,
					message
				})
			}

			return super.createSuccessResponse(res, 200, message, results)

		} catch (error) {
			return next({
				status: 500,
				error
			})
		}
	}

	async updateAccountActiveStatus(req, res, next) {
		try {

			const { accountId } = req.params;

			const { action } = req.body

			const { isCompleted, message } = await AccountService.updateAccountStatus(accountId, action)

			if (!isCompleted) {
				return next({
					status: 400,
					message
				})
			}

			return super.createSuccessResponse(res, 200, message)


		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}
}

module.exports = new AccountController();