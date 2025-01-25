const crypto = require("crypto");
const randomUniqueString = (size = 32) => {
	return crypto.randomBytes(size).toString("hex");
}

module.exports = randomUniqueString;