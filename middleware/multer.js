const multer = require("multer");

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "uploads/");
	},
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		const originalName = file.originalname;
		const extension = originalName.substring(originalName.lastIndexOf("."));
		const baseName = originalName.substring(0, originalName.lastIndexOf("."));
		cb(null, baseName + "-" + uniqueSuffix + extension);
	},
});

const fileFilter = (req, file, cb) => {
	if (
		file.mimetype === "image/jpeg" ||
		file.mimetype === "image/png" ||
		file.mimetype === "image/jpg" ||
		file.mimetype === "application/pdf" ||
		file.mimetype === "video/mp4"
	) {
		cb(null, true);
	} else {
		cb(new Error("File type not supported"), false);
	}
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = upload;
