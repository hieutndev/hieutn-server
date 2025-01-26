function requireRole(role) {
	return function (req, res, next) {
		if (req.role < role) {
			return res.status(403).json({
				status: "failure",
				message: "You don't have permission to perform this.",
			});
		}

		return next();

	}
}

module.exports = { requireRole }