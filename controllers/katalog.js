const { Katalog } = require("../models");

const getAllKatalog = async (req, res) => {
	try {
		const katalog = await Katalog.findAll({
			where: { status: "tersedia" },
		});
		res.status(200).json(katalog);
	} catch (error) {
		res.status(500).json({ message: "Error retrieving katalog", error });
	}
};

const getKatalogById = async (req, res) => {
	const { id } = req.params;
	try {
		const katalog = await Katalog.findByPk(id);
		if (katalog) {
			res.status(200).json(katalog);
		} else {
			res.status(404).json({ message: "Katalog not found" });
		}
	} catch (error) {
		res.status(500).json({ message: "Error retrieving katalog", error });
	}
};

module.exports = {
	getAllKatalog,
	getKatalogById,
};
