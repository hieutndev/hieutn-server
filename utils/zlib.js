const zlib = require("zlib");

function compressText(text) {
	return zlib.gzipSync(text).toString("base64");
}

function decompressText(compressedText) {
	return zlib.gunzipSync(Buffer.from(compressedText, "base64")).toString();
}

module.exports = {
	compressText,
	decompressText
}