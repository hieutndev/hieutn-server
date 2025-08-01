const BaseController = require("./BaseController");
const S3Service = require("../services/S3Service");
const { RESPONSE_CODE } = require("../constants/response-code")
const generateUniqueString = require("../utils/generate-unique-string");

class S3Controller extends BaseController {
	constructor() {
		super();
	}

	async uploadImage(req, res, next) {
		try {

			if (!req.file) {
				return super.createResponse(res, 404, RESPONSE_CODE.MISS_IMAGE_FILE)
			}

			console.log(req.file);

			const imageKey = `articles/article_${generateUniqueString()}`;
			await S3Service.uploadImage(req.file, imageKey);

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS_UPLOAD_IMAGE, {
				imageKey
			});

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async getImageByKey(req, res, next) {
		try {
			const { key } = req.query;

			const imageUrl = await S3Service.getImageUrl(key);

			return res.redirect(imageUrl);

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}
}

module.exports = new S3Controller();