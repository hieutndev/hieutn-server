const getDateRange = (period) => {
	const endDate = new Date();
	let startDate = new Date();
	let previousEndDate = new Date();
	let previousStartDate = new Date();

	switch (period) {
		case '24hours':
			startDate.setDate(endDate.getDate() - 1);
			previousEndDate.setDate(startDate.getDate());
			previousStartDate.setDate(previousEndDate.getDate() - 1);
			break;
		case '7days':
			startDate.setDate(endDate.getDate() - 7);
			previousEndDate.setDate(startDate.getDate());
			previousStartDate.setDate(previousEndDate.getDate() - 7);
			break;
		case '30days':
		default:
			startDate.setDate(endDate.getDate() - 30);
			previousEndDate.setDate(startDate.getDate());
			previousStartDate.setDate(previousEndDate.getDate() - 30);
			break;
		case '12months':
			startDate.setFullYear(endDate.getFullYear() - 1);
			previousEndDate.setDate(startDate.getDate());
			previousStartDate.setFullYear(previousEndDate.getFullYear() - 1);
			break;
	}

	return {
		startDate: startDate.toISOString().split('T')[0],
		endDate: endDate.toISOString().split('T')[0],
		previousStartDate: previousStartDate.toISOString().split('T')[0],
		previousEndDate: previousEndDate.toISOString().split('T')[0]
	};
}

module.exports = {
	getDateRange
}