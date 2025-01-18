const sharp = require('sharp');

const resizeImage = async (buffer, width, height) => {
	return sharp(buffer)
		.resize({
			width,
			height,
			fit: "contain"
		})
		.toBuffer();
}

module.exports = resizeImage;