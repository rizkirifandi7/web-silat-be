const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
const streamifier = require("streamifier");
dotenv.config();

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Middleware untuk upload ke Cloudinary dengan optimasi
const uploadToCloudinary = (req, res, next) => {
	if (!req.file) {
		return next();
	}

	const uploadStream = cloudinary.uploader.upload_stream(
		{
			folder: "anggota",
			resource_type: "image",
			// Optimasi transformasi
			transformation: [
				{
					width: 500,
					height: 500,
					crop: "limit", // Tidak crop, hanya resize jika lebih besar
					quality: "auto:best", // Auto quality optimization
				},
			],
			// Kompresi dan optimasi
			flags: "lossy",
			// Generate eager transformations untuk loading cepat
			eager: [
				{ width: 150, height: 150, crop: "fill", gravity: "face" }, // Thumbnail
				{ width: 300, height: 300, crop: "limit" }, // Medium
			],
			eager_async: true,
			// Cache control
			use_filename: true,
			unique_filename: true,
		},
		(error, result) => {
			if (error) {
				console.error("Cloudinary upload error:", error);
				return res.status(500).json({
					status: "error",
					message: "Gagal upload foto ke Cloudinary",
					error: error.message,
				});
			}
			// Return optimized URLs
			req.cloudinaryResult = {
				...result,
				thumb_url: result.eager?.[0]?.secure_url || result.secure_url,
				medium_url: result.eager?.[1]?.secure_url || result.secure_url,
			};
			next();
		}
	);

	streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
};

module.exports = cloudinary;
module.exports.uploadToCloudinary = uploadToCloudinary;
