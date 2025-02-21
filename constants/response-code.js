const RESPONSE_CODE = {
	SUCCESS: {
		SUCCESS_GET_ALL: {
			CODE: "SUCCESS_GET_ALL",
			MESSAGE: (resource) => `Successfully fetched ${resource}`
		},
		SUCCESS_GET_ONE: {
			CODE: "SUCCESS_GET_ONE",
			MESSAGE: (resource) => `Successfully fetched ${resource} details`
		},
		SUCCESS_CREATE: {
			CODE: "SUCCESS_CREATE",
			MESSAGE: (resource) => `Successfully created new ${resource}`
		},
		SUCCESS_UPDATE: {
			CODE: "SUCCESS_UPDATE",
			MESSAGE: (resource) => `Successfully updated ${resource}`
		},
		SUCCESS_DELETE: {
			CODE: "SUCCESS_DELETE",
			MESSAGE: (resource) => `Successfully deleted ${resource}`
		},
		SUCCESS_RECOVER: {
			CODE: "SUCCESS_RECOVER",
			MESSAGE: (resource) => `Successfully recovered ${resource}`
		},
		SUCCESS_SIGN_IN: {
			CODE: "SUCCESS_SIGN_IN",
			MESSAGE: "Successfully signed in"
		},

		SUCCESS_SIGN_UP: {
			CODE: "SUCCESS_SIGN_UP",
			MESSAGE: "Account created successfully"
		},
		SUCCESS_GET_NEW_ACCESS_TOKEN: {
			CODE: "SUCCESS_GET_NEW_ACCESS_TOKEN",
			MESSAGE: `Successfully generated new access token`
		},
		SUCCESS_BLOCK: {
			CODE: "SUCCESS_BLOCK",
			MESSAGE: "Successfully blocked account"
		},
		SUCCESS_UNBLOCK: {
			CODE: "SUCCESS_UNBLOCK",
			MESSAGE: "Successfully unblocked account"
		},
		SUCCESS_LOGOUT: {
			CODE: "SUCCESS_LOGOUT",
			MESSAGE: "Successfully logged out"
		},
		VALID_EMAIL: {
			CODE: "VALID_EMAIL",
			MESSAGE: "Email is valid"

		}
	},
	ERROR: {
		ALREADY_IN_SOFT_DELETE: {
			CODE: "ALREADY_IN_SOFT_DELETE",
			MESSAGE: (resource) => `${resource} is already in soft delete status`
		},
		NOT_IN_SOFT_DELETE: {
			CODE: "NOT_IN_SOFT_DELETE",
			MESSAGE: (resource) => `${resource} is not in soft delete status`
		},
		NOT_MATCH: {
			CODE: "NOT_MATCH",
			MESSAGE: (resource1, resource2) => `${resource2} does not match ${resource1}`
		},
		NOT_FOUND: {
			CODE: "NOT FOUND",
			MESSAGE: (resource) => ``,
		},
		PASSWORD_NOT_STRONG_ENOUGH: {
			CODE: "PASSWORD_NOT_STRONG_ENOUGH",
			MESSAGE: "Password is not strong enough"
		},
		WRONG_PASSWORD: {
			CODE: "WRONG_PASSWORD",
			MESSAGE: "Wrong password"
		},
		EMAIL_ALREADY_EXIST: {
			CODE: "EMAIL_ALREADY_EXIST",
			MESSAGE: "Email already exist"
		},
		USERNAME_ALREADY_EXIST: {
			CODE: "USERNAME_ALREADY_EXIST",
			MESSAGE: "Username already exist"
		},
		EMAIL_NOT_FOUND: {
			CODE: "EMAIL_NOT_FOUND",
			MESSAGE: "No account found with the email provided"
		},
		USER_ID_NOT_FOUND: {
			CODE: "USER_ID_NOT_FOUND",
			MESSAGE: "No account found with the user_id provided"
		},
		USERNAME_NOT_FOUND: {
			CODE: "USERNAME_NOT_FOUND",
			MESSAGE: "No account found with the username provided"
		},
		WRONG_REFRESH_TOKEN: {
			CODE: "WRONG_REFRESH_TOKEN",
			MESSAGE: "The refresh token you provided doesn't match the refresh token on the server."
		},
		PASSWORD_NOT_MATCH: {
			CODE: "PASSWORD_NOT_MATCH",
			MESSAGE: "Wrong password"
		},
		ALREADY_BLOCKED: {
			CODE: "ALREADY_BLOCKED",
			MESSAGE: "Account is already blocked"
		},
		ACCOUNT_NOT_BLOCKED: {
			CODE: "ACCOUNT_NOT_BLOCKED",
			MESSAGE: "Account is not blocked"
		},
		INVALID_FIELD_VALUE: {
			CODE: "INVALID_FIELD_VALUE",
			MESSAGE: (field) => `Invalid value for ${field}`
		}
	},

}

module.exports = { RESPONSE_CODE };