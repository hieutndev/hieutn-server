const ResponseMessage = {
	successGetAll: (resource) => `Successfully fetched ${resource}`,
	successGetOne: (resource) => `Successfully fetched ${resource} details`,
	successCreate: (resource) => `Successfully created new ${resource}`,
	successUpdate: (resource) => `Successfully updated ${resource}`,
	successDelete: (resource) => `Successfully deleted ${resource}`,
	successRecover: (resource) => `Successfully recovered ${resource}`,
	alreadyInSoftDelete: (resource) => `${resource} is already in soft delete status`,
	notInSoftDelete: (resource) => `${resource} is not in soft delete status`,
}

module.exports = ResponseMessage;