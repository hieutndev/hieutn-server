const REGEX = {
	EMAIL: /^[a-zA-Z0-9._%+-]+@gmail\.com$/,
	PASSWORD: /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
	DATETIME_SQL: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
}

module.exports = REGEX