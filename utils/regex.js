const REGEX = {
	EMAIL: /^[a-zA-Z0-9._%+-]+@gmail\.com$/,
	PASSWORD: /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/
}

module.exports = REGEX