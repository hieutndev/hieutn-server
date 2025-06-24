const BaseController = require("./BaseController")
const CertificationService = require("../services/CertificationService");
const { RESPONSE_CODE } = require("../constants/response-code");
const generateUniqueString = require("../utils/generate-unique-string");

class CertificationController extends BaseController {
	constructor() {
		super();
	}

	async getAllCerts(req, res, next) {
		try {

			const listCerts = await CertificationService.getAllCerts();

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS_GET_ALL_CERTS, listCerts);

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async addNewCert(req, res, next) {

		try {

			const { title, issued_by, issued_date } = req.body;

			if (!req.file) {
				return super.createResponse(res, 404, RESPONSE_CODE.MISS_CERT_IMAGE)
			}

			const imageName = `cert_${generateUniqueString()}`;

			const [, newCertId] = await Promise.all([
				CertificationService.uploadCertImage(req.file, imageName),
				CertificationService.createNewCert(title, issued_by, issued_date, imageName)
			])

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS_ADD_CERT, {
				newCertId
			})
		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async getCertInfo(req, res, next) {
		try {
			const { certId } = req.params;

			const certInfo = await CertificationService.getCertInfoById(certId, true);

			if (!certInfo) {
				return super.createResponse(res, 404, RESPONSE_CODE.CERT_NOT_FOUND);
			}

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS_GET_CERT_INFO, certInfo);

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async updateCertInfo(req, res, next) {
		try {

			const { certId } = req.params;

			const { title, issued_by, issued_date } = req.body;

			const certInfo = await CertificationService.getCertInfoById(certId, false);

			if (!certInfo) {
				return super.createResponse(res, 404, RESPONSE_CODE.CERT_NOT_FOUND);
			}

			await Promise.all([
				req.file && CertificationService.uploadCertImage(req.file, certInfo.image_name),
				CertificationService.updateCertInfo(certId, title, issued_by, issued_date)
			])

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS_UPDATE_CERT_INFO);

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async softDeleteCert(req, res, next) {
		try {

			const { certId } = req.params


			const certInfo = await CertificationService.getCertInfoById(certId);

			if (!certInfo) {
				return super.createResponse(res, 404, RESPONSE_CODE.CERT_NOT_FOUND);
			}

			if (certInfo.is_deleted === 1) {
				return super.createResponse(res, 404, RESPONSE_CODE.ALREADY_IN_SOFT_DELETE);
			}

			await CertificationService.softDeleteCert(certId);

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS_DELETE_CERT);

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async recoverCert(req, res, next) {
		try {

			const { certId } = req.params

			const certInfo = await CertificationService.getCertInfoById(certId);

			if (!certInfo) {
				return super.createResponse(res, 404, RESPONSE_CODE.CERT_NOT_FOUND);
			}

			if (certInfo.is_deleted === 0) {
				return super.createResponse(res, 404, RESPONSE_CODE.NOT_IN_SOFT_DELETE);
			}

			await CertificationService.recoverCert(certId)

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS_RECOVER_CERT);


		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async permanentDeleteCert(req, res, next) {
		try {

			const { certId } = req.params;

			const certInfo = await CertificationService.getCertInfoById(certId);

			if (!certInfo) {
				return super.createResponse(res, 404, RESPONSE_CODE.CERT_NOT_FOUND);
			}

			if (certInfo.is_deleted === 0) {
				return super.createResponse(res, 404, RESPONSE_CODE.ALREADY_IN_SOFT_DELETE);
			}

			await CertificationService.permanentDeleteCert(certId);

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS_DELETE_CERT)

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}


}

module.exports = new CertificationController();