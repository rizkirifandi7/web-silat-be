const router = require("express").Router();
const multer = require("multer");
const { uploadToCloudinary } = require("../middleware/cloudinary");
const verifyToken = require("../middleware/verifyToken");
const { successResponse, errorResponse } = require("../utils/response");

// Konfigurasi Multer untuk memory storage
const storage = multer.memoryStorage();
const upload = multer({
	storage: storage,
	limits: {
		fileSize: 5 * 1024 * 1024, // 5MB
	},
	fileFilter: (req, file, cb) => {
		const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
		if (allowedTypes.includes(file.mimetype)) {
			cb(null, true);
		} else {
			cb(new Error("Format file tidak didukung. Gunakan JPG, PNG, atau WebP."));
		}
	},
});

// Upload foto anggota kepengurusan dengan optimasi
router.post(
	"/anggota",
	verifyToken,
	upload.single("foto"),
	uploadToCloudinary,
	async (req, res) => {
		try {
			if (!req.cloudinaryResult) {
				return errorResponse(res, "Upload foto gagal", 400);
			}

			const result = req.cloudinaryResult;

			// Return multiple URLs untuk optimasi loading
			const responseData = {
				url: result.secure_url, // Original optimized
				thumb_url: result.thumb_url, // Thumbnail 150x150
				medium_url: result.medium_url, // Medium 300x300
				public_id: result.public_id,
				format: result.format,
				width: result.width,
				height: result.height,
				bytes: result.bytes,
			};

			// Set cache headers
			res.set({
				"Cache-Control": "public, max-age=31536000, immutable",
				"CDN-Cache-Control": "public, max-age=31536000",
			});

			return successResponse(
				res,
				responseData,
				"Foto berhasil diupload dan dioptimasi",
				200
			);
		} catch (error) {
			console.error("Error upload foto anggota:", error);
			return errorResponse(res, "Gagal upload foto", 500, error.message);
		}
	}
);

module.exports = router;
