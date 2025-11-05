const { Rekening } = require("../models");
const fs = require("fs");
const cloudinary = require("../middleware/cloudinary");

const getAllRekening = async (req, res) => {
	try {
		const rekening = await Rekening.findAll();
		res.status(200).json(rekening);
	} catch (error) {
		res.status(500).json({ message: "Error retrieving rekening", error });
	}
};

const getRekeningById = async (req, res) => {
	const { id } = req.params;
	try {
		const rekening = await Rekening.findByPk(id);
		if (rekening) {
			res.status(200).json(rekening);
		} else {
			res.status(404).json({ message: "Rekening not found" });
		}
	} catch (error) {
		res.status(500).json({ message: "Error retrieving rekening", error });
	}
};

const createRekening = async (req, res) => {
	const { namaBank, noRekening, namaPemilik } = req.body;
	try {
		let gambarUrl = null;
		if (req.file) {
			const result = await cloudinary.uploader.upload(req.file.path, {
				folder: "rekening",
				use_filename: true,
				unique_filename: false,
				overwrite: true,
			});

			gambarUrl = result.secure_url;
			// Hapus file lokal setelah upload berhasil
			fs.unlinkSync(req.file.path);
		}
		const newRekening = await Rekening.create({
			logo: gambarUrl,
			namaPemilik,
			namaBank,
			noRekening,
		});
		res.status(201).json(newRekening);
	} catch (error) {
		res.status(500).json({ message: "Error creating rekening", error });
	}
};

const updateRekening = async (req, res) => {
	const { id } = req.params;
	const { namaBank, noRekening, namaPemilik } = req.body;
	try {
		const rekening = await Rekening.findByPk(id);
		if (!rekening) {
			return res.status(404).json({ message: "Rekening not found" });
		}

		if (req.file) {
			try {
				if (rekening.logo) {
					const publicId = rekening.logo.split("/").pop().split(".")[0];
					await cloudinary.uploader.destroy(`rekening/${publicId}`);
				}

				const result = await cloudinary.uploader.upload(req.file.path, {
					folder: "rekening",
					use_filename: true,
					unique_filename: false,
					overwrite: true,
				});
				req.body.logo = result.secure_url;
			} catch (uploadError) {
				fs.unlinkSync(req.file.path);
				return res
					.status(500)
					.json({ message: "Error uploading logo", uploadError });
			}
			rekening.set(req.body);
			await rekening.save();
			// Hapus file lokal setelah save berhasil
			fs.unlinkSync(req.file.path);
		} else {
			rekening.namaPemilik = namaPemilik;
			rekening.namaBank = namaBank;
			rekening.noRekening = noRekening;
			await rekening.save();
			res.status(200).json(rekening);
		}
	} catch (error) {
		res.status(500).json({ message: "Error updating rekening", error });
	}
};

const deleteRekening = async (req, res) => {
	const { id } = req.params;
	try {
		const rekening = await Rekening.findByPk(id);
		if (!rekening) {
			return res.status(404).json({ message: "Rekening not found" });
		}

		await rekening.destroy();
		res.status(200).json({ message: "Rekening deleted successfully" });
	} catch (error) {
		res.status(500).json({ message: "Error deleting rekening", error });
	}
};

module.exports = {
	getAllRekening,
	getRekeningById,
	createRekening,
	updateRekening,
	deleteRekening,
};
