const crypto = require("crypto");
const randomUniqueString = () => {
	return crypto.randomBytes(32).toString("hex");
}

module.exports = randomUniqueString;