const jwt = require("jsonwebtoken");

async function generateAccessToken(accountDetails) {
	return await jwt.sign(accountDetails, process.env.JWT_SECRET, { expiresIn: "10s" });
}

async function generateRefreshToken(user_id) {
	return await jwt.sign({ user_id }, process.env.JWT_SECRET, { expiresIn: "24h" });
}

async function verifyToken(token) {
	return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = {
	generateAccessToken,
	generateRefreshToken,
	verifyToken
}