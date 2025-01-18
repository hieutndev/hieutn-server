const ResponseMessage = {
	successGetAll: (resource) => `Successfully fetched ${resource}`,
	successGetOne: (resource) => `Successfully fetched ${resource} details`,
	successCreate: (resource) => `Successfully created new ${resource}`,
	successUpdate: (resource) => `Successfully updated ${resource}`,
	successDelete: (resource) => `Successfully deleted ${resource}`,
}

module.exports = ResponseMessage;