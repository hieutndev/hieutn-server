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

	async getAllCerts() {
		try {
			const getAllStatus = await super.query(certificationSQL.getAllCertifications);

			if (!getAllStatus.isCompleted) {
				return {
					isCompleted: false,
					message: getAllStatus.message
				}
			}

			return {
				isCompleted: true,
				message: RESPONSE_CODE.SUCCESS.SUCCESS_GET_ALL.CODE,
				results: getAllStatus.results
			}
		} catch (error) {
			return {
				isCompleted: false,
				message: error,
			}
		}
	}

	async addNewCert({ title, issued_by, issued_date }, cert_image_file) {
		try {

			const imageName = randomUniqueString();

			const [insertStatus] = await Promise.all([super.query(certificationSQL.addNewCertification, [title, issued_by, issued_date, imageName]), s3Bucket.putObject(imageName, cert_image_file, true)])

			if (!insertStatus.isCompleted) {
				await s3Bucket.deleteObject(imageName);

				return {
					isCompleted: false,
					message: insertStatus.message,
				}

			}



			return {
				isCompleted: true,
				message: RESPONSE_CODE.SUCCESS.SUCCESS_CREATE.CODE,
				results: {
					newCertId: insertStatus.results.insertId
				}
			}

		} catch (error) {
			return {
				isCompleted: false,
				message: error,
			}
		}
	}

	async getCertInfoById(certId, getCertImage = false) {

		const certInfo = await super.query(certificationSQL.getCertificationDetails, [certId]);



		if (!certInfo.isCompleted) {
			throw new Error(certInfo.message);
		}

		if (certInfo.results.length === 0) {
			return false;
		}

		return {
			...certInfo.results[0],
			image_url: getCertImage ? await s3Bucket.getObject(certInfo.results[0].img_name) : certInfo.results[0].img_name
		}

	}

	async getCertInfo(certId) {
		try {

			const certInfo = await this.getCertInfoById(certId, true);


			return {
				isCompleted: true,
				message: RESPONSE_CODE.SUCCESS.SUCCESS_GET_ONE.CODE,
				results: certInfo
			}

		} catch (error) {
			return {
				isCompleted: false,
				message: error,
			}
		}
	}


	async updateCertImage(certId, newImage) {

		try {

			const certInfo = await this.getCertInfoById(certId);

			if (!certInfo) {
				throw new Error(RESPONSE_CODE.ERROR.NOT_FOUND.CODE);
			}

			await s3Bucket.putObject(certInfo.img_name, newImage, true);

			return true

		} catch (error) {
			throw error
		}

	}

	async updateCertInfo(cert_id, { title, issued_by, issued_date, is_change_image }, cert_image) {
		try {

			if (is_change_image === "true") {
				await this.updateCertImage(cert_id, cert_image);
			}

			const updateCertDetails = await super.query(certificationSQL.updateCertification, [title, issued_by, issued_date, cert_id]);

			if (!updateCertDetails.isCompleted) {
				return {
					isCompleted: false,
					message: updateCertDetails.message
				}
			}

			return {
				isCompleted: true,
				message: RESPONSE_CODE.SUCCESS.SUCCESS_UPDATE.CODE
			}


		} catch (error) {
			return {
				isCompleted: false,
				message: error,
			}
		}
	}

	async softDeleteCert(certId) {
		try {

			const certStatus = await this.getCertInfoById(certId);

			if (!certStatus) {
				return {
					isCompleted: false,
					message: RESPONSE_CODE.ERROR.NOT_FOUND.CODE,
				}
			}

			if (certStatus.is_deleted) {
				return {
					isCompleted: false,
					message: RESPONSE_CODE.ERROR.ALREADY_IN_SOFT_DELETE.CODE,
				}
			}

			const softDeleteStatus = await super.query(certificationSQL.softDeleteCertification, [certId]);

			if (!softDeleteStatus.isCompleted) {
				return {
					isCompleted: false,
					message: softDeleteStatus.message
				}
			}

			return {
				isCompleted: true,
				message: RESPONSE_CODE.SUCCESS.SUCCESS_DELETE.CODE
			}

		} catch (error) {
			return {
				isCompleted: false,
				message: error,
			}
		}
	}

	async recoverCert(certId) {
		try {

			const certStatus = await this.getCertInfoById(certId);

			if (!certStatus) {
				return {
					isCompleted: false,
					message: RESPONSE_CODE.ERROR.NOT_FOUND.CODE
				}
			}

			if (!certStatus.is_deleted) {
				return {
					isCompleted: false,
					message: RESPONSE_CODE.ERROR.NOT_IN_SOFT_DELETE.CODE
				}
			}

			const recoverStatus = await super.query(certificationSQL.recoverCertification, [certId]);

			if (!recoverStatus.isCompleted) {
				return {
					isCompleted: false,
					message: recoverStatus.message
				}
			}

			return {
				isCompleted: true,
				message: RESPONSE_CODE.SUCCESS.SUCCESS_RECOVER.CODE
			}

		} catch (error) {
			return {
				isCompleted: false,
				message: error,
			}
		}
	}

	async permanentDeleteCert(certId) {
		try {

			const certStatus = await this.getCertInfoById(certId);

			if (!certStatus) {
				return {
					isCompleted: false,
					message: RESPONSE_CODE.ERROR.NOT_FOUND.CODE
				}
			}

			if (!certStatus.is_deleted) {
				return {
					isCompleted: false,
					message: RESPONSE_CODE.ERROR.NOT_IN_SOFT_DELETE.CODE
				}
			}

			const deleteStatus = await super.query(certificationSQL.permanentDeleteCertification, [certId]);

			if (!deleteStatus.isCompleted) {
				return {
					isCompleted: false,
					message: deleteStatus.message
				}
			}

			return {
				isCompleted: true,
				message: RESPONSE_CODE.SUCCESS.SUCCESS_DELETE.CODE
			}

		} catch (error) {
			return {
				isCompleted: false,
				message: error,
			}
		}
	}

}

module.exports = new CertificationService();