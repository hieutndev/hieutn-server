const jwt = require('jsonwebtoken');

const AccountService = require('../services/AccountService');
const { verifyToken } = require("../utils/jwt-helpers");

async function refreshTokenChecker(req, res, next) {
	const token = req.headers['x-rftk'];

	if (!token) {
		return res.status(401).json({
			status: "failure",
			message: "Unauthorized"
		});
	}

	const { user_id } = await verifyToken(token);

	req.user_id = user_id;
	req.refresh_token = token;

	return next();
}

async function accessTokenChecker(req, res, next) {
	const token = req.headers['authorization'] ? req.headers['authorization'].split(' ')[1] : null;

	if (!token || token === "null" || token === "undefined") {
		return res.status(401).json({
			status: "failure",
			message: "Unauthorized"
		});
	}

	try {
		const { user_id, role } = await verifyToken(token);

		req.user_id = user_id;
		req.role = role;

		return next();
	} catch (error) {
		if (error.name === "TokenExpiredError") {
			return res.status(401).json({
				status: "failure",
				message: "Token Expired"
			});
		}
		return res.status(500).json({
			status: "error",
			message: error
		})
	}
}

module.exports = { refreshTokenChecker, accessTokenChecker }