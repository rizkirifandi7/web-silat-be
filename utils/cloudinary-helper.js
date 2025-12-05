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
		} catch (unlinkError) {
			// Silently ignore temporary file deletion errors
		}

		return result;
	} catch (error) {
		// Try to delete temporary file even if upload fails
		try {
			await fs.unlink(filePath);
		} catch (unlinkError) {
			// Silently ignore temporary file deletion errors
		}

		throw error;
	}
};

module.exports = {
	uploadToCloudinaryAndDelete,
};

