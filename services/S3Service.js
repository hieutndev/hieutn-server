const BaseService = require("./BaseService");

class S3Service extends BaseService {
	constructor() {
		super();
	}

	async uploadImage(imageFile, imageName) {
		return super.s3Upload(imageFile, {
			imageName,
		});
	}

	async deleteImage(imageName) {
		return await super.s3Delete(imageName);
	}

	async getImageUrl(imageName) {
		return await super.s3GetUrl(imageName);
	}
}

module.exports = new S3Service();