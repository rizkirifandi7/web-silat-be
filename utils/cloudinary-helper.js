const fs = require("fs").promises;
const cloudinary = require("../middleware/cloudinary");

/**
 * Upload file to Cloudinary and delete temporary file
 * @param {string} filePath - Local file path
 * @param {object} options - Cloudinary upload options
 * @returns {Promise<object>} - Cloudinary upload result
 */
const uploadToCloudinaryAndDelete = async (filePath, options = {}) => {
	try {
		// Upload to Cloudinary
		const result = await cloudinary.uploader.upload(filePath, options);

		// Delete temporary file
		try {
			await fs.unlink(filePath);
			console.log(`Temporary file deleted: ${filePath}`);
		} catch (unlinkError) {
			console.error(
				`Error deleting temporary file ${filePath}:`,
				unlinkError.message
			);
		}

		return result;
	} catch (error) {
		// Try to delete temporary file even if upload fails
		try {
			await fs.unlink(filePath);
			console.log(`Temporary file deleted after error: ${filePath}`);
		} catch (unlinkError) {
			console.error(
				`Error deleting temporary file ${filePath}:`,
				unlinkError.message
			);
		}

		throw error;
	}
};

module.exports = {
	uploadToCloudinaryAndDelete,
};
