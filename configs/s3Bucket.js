const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const resizeImage = require("../utils/resize-image");

class S3Bucket {


	constructor() {

	}

	createBucket() {
		return new S3Client({
			credentials: {
				accessKeyId: process.env.BUCKET_ACCESS_KEY,
				secretAccessKey: process.env.BUCKET_SECRET_KEY,
			},
			region: process.env.BUCKET_REGION
		})
	}

	async putObject(objectName, { buffer, mimetype }, isResize = false, fit = "contain") {
		try {
			let resizeBuffer;
			if (isResize) {
				resizeBuffer = await resizeImage(buffer, 1920, 1080, fit);
				console.log(isResize ? "resizeBuffer" : "buffer")
			}

			const s3Client = this.createBucket();


			const params = {
				Bucket: process.env.BUCKET_NAME,
				Key: objectName,
				Body: isResize ? resizeBuffer : buffer,
				ContentType: mimetype
			}

			console.log("objectName", objectName);


			const command = new PutObjectCommand(params);
			return await s3Client.send(command);
		} catch (error) {
			throw new Error(error);
		}
	}

	async getObject(objectName) {

		try {
			const s3Client = this.createBucket();

			const params = {
				Bucket: process.env.BUCKET_NAME,
				Key: objectName
			}

			const command = new GetObjectCommand(params);
			return await getSignedUrl(s3Client, command, { expiresIn: 3600 })
		} catch (error) {
			throw new Error(error);
		}
	}

	async deleteObject(objectName) {
		try {
			const s3Client = this.createBucket();

			const params = {
				Bucket: process.env.BUCKET_NAME,
				Key: objectName
			}

			const command = new DeleteObjectCommand(params);
			return await s3Client.send(command)
		} catch (error) {
			throw new Error(error);
		}
	}

}

module.exports = new S3Bucket();