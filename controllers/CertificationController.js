const BaseController = require("./BaseController")
const CertificationService = require("../services/CertificationService");


class CertificationController extends BaseController {
	constructor() {
		super();
	}

	async getAllCerts(req, res, next) {
		try {

			const { isCompleted, message, results } = await CertificationService.getAllCerts();

			if (!isCompleted) {
				return super.createResponse(res, 400, message)
			}

			return super.createResponse(res, 200, message, results)

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async addNewCert(req, res, next) {

		try {

			const { isCompleted, message, results } = await CertificationService.addNewCert(req.body, req.file)

			if (!isCompleted) {
				return super.createResponse(res, 400, message)
			}

			return super.createResponse(res, 200, message, results)
		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async getCertInfo(req, res, next) {
		try {
			const { certId } = req.params;

			const { isCompleted, message, results } = await CertificationService.getCertInfo(certId, true);

			if (!isCompleted) {
				return super.createResponse(res, 400, message)
			}

			return super.createResponse(res, 200, message, results)

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async updateCertInfo(req, res, next) {
		try {

			const { certId } = req.params;

			const {
				isCompleted,
				message,
			} = await CertificationService.updateCertInfo(certId, req.body, req.file)

			if (!isCompleted) {
				return super.createResponse(res, 400, message)
			}

			return super.createResponse(res, 200, message || "test")

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async softDeleteCert(req, res, next) {
		try {

			const { certId } = req.params

			const { isCompleted, message } = await CertificationService.softDeleteCert(certId);

			if (!isCompleted) {
				return super.createResponse(res, 400, message)
			}

			return super.createResponse(res, 200, message)

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async recoverCert(req, res, next) {
		try {

			const { certId } = req.params

			const { isCompleted, message } = await CertificationService.recoverCert(certId);

			if (!isCompleted) {
				return super.createResponse(res, 400, message)
			}

			return super.createResponse(res, 200, message)


		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async permanentDeleteCert(req, res, next) {
		try {

			const { certId } = req.params;

			const { isCompleted, message } = await CertificationService.permanentDeleteCert(certId);

			if (!isCompleted) {
				return super.createResponse(res, 400, message)
			}

			return super.createResponse(res, 200, message)

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}


}

module.exports = new CertificationController();