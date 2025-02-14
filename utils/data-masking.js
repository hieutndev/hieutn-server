const emailMasking = (email) => {
	if (!email.includes('@')) {
		throw new Error('Invalid email');
	}

	const [localPart, ...domainParts] = email.split('@', 2);
	const domain = domainParts.join('@');

	let maskedLocal;
	if (localPart.length > 2) {
		maskedLocal = localPart.substring(0, 2) + '**';
	} else {
		maskedLocal = localPart; // Giữ nguyên nếu quá ngắn
	}

	return maskedLocal + '@' + domain;
}

module.exports = {
	emailMasking
}
