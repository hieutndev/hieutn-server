function requireRole(role) {
	return function (req, res, next) {
		if (req.role < role) {
			return res.status(403).json({
				status: "failure",
				message: "NO_PERMISSION",
			});
		}
		return next();
	}
}

module.exports = { requireRole }