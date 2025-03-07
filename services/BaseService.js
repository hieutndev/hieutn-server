const mySLQ = require("../configs/mysql");
const s3Bucket = require("../configs/s3-bucket");
const generateUniqueString = require("../utils/generate-unique-string");

class BaseService {
	constructor() {
	}

	async query(sqlString, values) {
		return await mySLQ.query(sqlString, values);
	};

	async queryMany(sqlString, values) {
		return await mySLQ.queryMany(sqlString, values);
	};

	async s3Upload(imageFile, { imageName, fit = 'cover', isResize = false, width, height }) {
		try {
			await s3Bucket.putObject(imageName, imageFile, {
				isResize,
				fit,
				width,
				height
			});

			return true
		} catch (error) {
			throw new Error(error)
		}
	}

	async s3Update(imageName, imageFile) {
		try {

			await s3Bucket.putObject(imageName, imageFile, false, 'cover');

			return {
				imageName,
			}

		} catch (error) {
			throw new Error(error)
		}
	}

	async s3GetUrl(imageName) {
		return s3Bucket.getObject(imageName)
	}

	async s3Delete(imageName) {
		await s3Bucket.deleteObject(imageName);
	}
}

module.exports = BaseService;