const BaseService = require("./BaseService")
const randomUniqueString = require("../utils/generate-unique-string");
const { certificationSQL } = require("../utils/sql-query-string");
const s3Bucket = require("../configs/s3-bucket");
const Message = require("../utils/response-message");
const { RESPONSE_CODE } = require("../constants/response-code");

class CertificationService extends BaseService {
	constructor() {
		super();
	}

	async uploadCertImage(imageFile, certImageName) {
		return super.s3Upload(imageFile, {
			imageName: certImageName,
			fit: 'contain',
			isResize: true,
			width: 1920,
			height: 1080,
		});

	}

	async getAllCerts() {

		const { isCompleted, message, results } = await super.query(certificationSQL.getAllCertifications);

		if (!isCompleted) {
			throw message;
		}

		return results

	}

	async createNewCert(title, issuedBy, issuedDate, imageName) {

		const {
			isCompleted,
			message,
			results
		} = await super.query(certificationSQL.addNewCertification, [title, issuedBy, issuedDate, imageName])

		if (!isCompleted) {
			await s3Bucket.deleteObject(imageName);
			throw message;
		}

		return results.insertId

	}

	async getCertInfoById(certId, isParseImageUrl = false) {

		const { isCompleted, message, results } = await super.query(certificationSQL.getCertificationDetails, [certId]);


		if (!isCompleted) {
			throw message;
		}

		if (results.length === 0) {
			return false;
		}

		return {
			...results[0],
			image_url: isParseImageUrl ? await s3Bucket.getObject(results[0].img_name) : results[0].img_name
		}

	}

	async updateCertInfo(certId, title, issuedBy, issuedDate) {

		const {
			isCompleted,
			message
		} = await super.query(certificationSQL.updateCertification, [title, issuedBy, issuedDate, certId]);

		if (!isCompleted) {
			throw message
		}

		return true
	}

	async softDeleteCert(certId) {

		const { isCompleted, message, results } = await super.query(certificationSQL.softDeleteCertification, [certId]);

		if (!isCompleted) {
			throw message
		}

		return true
	}

	async recoverCert(certId) {

		const { isCompleted, message } = await super.query(certificationSQL.recoverCertification, [certId]);

		if (!isCompleted) {
			throw message;
		}

		return true


	}

	async permanentDeleteCert(certId) {

		const { isCompleted, message } = await super.query(certificationSQL.permanentDeleteCertification, [certId]);

		if (!isCompleted) {
			throw message
		}

		return true


	}

}

module.exports = new CertificationService();