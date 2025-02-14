const sharp = require('sharp');

const resizeImage = async (buffer, width, height, fit = "contain") => {
	return sharp(buffer)
		.resize({
			width,
			height,
			fit: fit
		})
		.toBuffer();
}

module.exports = resizeImage;