const BaseService = require("./BaseService")
const randomUniqueString = require("../utils/generate-unique-string");
const { certificationSQL } = require("../utils/SQLQueryString");
const s3Bucket = require("../configs/s3Bucket");
const Message = require("../utils/ResponseMessage");

class CertificationService extends BaseService {
	constructor() {
		super();
	}

	async getAll() {
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
				message: Message.successGetAll("certification"),
				results: getAllStatus.results
			}
		} catch (error) {
			return {
				isCompleted: false,
				message: error,
			}
		}
	}

	async addNewCertification({ title, issued_by, issued_date }, certImage) {
		try {

			const img_name = randomUniqueString();

			const insertStatus = await super.query(certificationSQL.addNewCertification, [title, issued_by, issued_date, img_name]);

			if (!insertStatus.isCompleted) {
				return {
					isCompleted: false,
					message: insertStatus.message,
				}
			}

			await s3Bucket.putObject(img_name, certImage, true);

			return {
				isCompleted: true,
				message: Message.successCreate("Certification"),
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

	async getCertificationDetails(certId, getImageURL = false) {
		try {

			const certDetails = await super.query(certificationSQL.getCertificationDetails, [certId]);

			if (!certDetails.isCompleted) {
				return {
					isCompleted: false,
					message: certDetails.message
				}
			}

			let imageUrl = null;

			// if (getImageURL) {
			// 	imageUrl = await s3Bucket.getObject(certDetails.results[0].img_name);
			// }


			return {
				isCompleted: true,
				message: Message.successGetOne("certification"),
				results: {
					...certDetails.results[0],
					image_url: imageUrl,
				}
			}


		} catch (error) {
			return {
				isCompleted: false,
				message: error,
			}
		}
	}


	async updateCertificationImage(certId, newImage) {

		try {

			const certDetails = await this.getCertificationDetails(certId);

			if (!certDetails.isCompleted) {
				return {
					isCompleted: false,
					message: certDetails.message
				}
			}

			await s3Bucket.putObject(certDetails.results.img_name, newImage, true);
			return {
				isCompleted: true,
			}
		} catch (error) {
			return {
				isCompleted: false,
				message: error,
			}
		}

	}

	async updateCertification(certId, { title, issued_by, issued_date, isChangeCertImage }, certImage) {
		try {

			if (isChangeCertImage === "true") {
				const updateCertImage = await this.updateCertificationImage(certId, certImage);

				if (!updateCertImage.isCompleted) {
					return {
						isCompleted: false,
						message: updateCertImage.message
					}
				}
			}

			const updateCertDetails = await super.query(certificationSQL.updateCertification, [title, issued_by, issued_date, certId]);

			if (!updateCertDetails.isCompleted) {
				return {
					isCompleted: false,
					message: updateCertDetails.message
				}
			}

			return {
				isCompleted: true,
				message: Message.successUpdate("certification")
			}


		} catch (error) {
			return {
				isCompleted: false,
				message: error,
			}
		}
	}

	async softDeleteCertification(certId) {
		try {

			const certStatus = await this.getCertificationDetails(certId);

			if (!certStatus.isCompleted) {
				return {
					isCompleted: false,
					message: certStatus.message
				}
			}

			if (certStatus.results.is_deleted) {
				return {
					isCompleted: false,
					message: Message.alreadyInSoftDelete("certification")
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
				message: Message.successDelete("certification")
			}

		} catch (error) {
			return {
				isCompleted: false,
				message: error,
			}
		}
	}

	async recoverCertification(certId) {
		try {

			const certStatus = await this.getCertificationDetails(certId);

			if (!certStatus.isCompleted) {
				return {
					isCompleted: false,
					message: certStatus.message
				}
			}

			if (!certStatus.results.is_deleted) {
				return {
					isCompleted: false,
					message: Message.notInSoftDelete("certification")
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
				message: Message.successRecover("certification")
			}

		} catch (error) {
			return {
				isCompleted: false,
				message: error,
			}
		}
	}

	async permanentDeleteCertification(certId) {
		try {

			const certStatus = await this.getCertificationDetails(certId);

			if (!certStatus.isCompleted) {
				return {
					isCompleted: false,
					message: certStatus.message
				}
			}

			if (!certStatus.results.is_deleted) {
				return {
					isCompleted: false,
					message: Message.notInSoftDelete("certification")
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
				message: Message.successDelete("certification")
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