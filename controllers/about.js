const { About } = require("../models");
const { successResponse, errorResponse } = require("../utils/response");

class AboutController {
	// Get active about content
	static async getActiveAbout(req, res) {
		try {
			const about = await About.findOne({
				where: { isActive: true },
				order: [["updatedAt", "DESC"]],
			});

			if (!about) {
				return successResponse(res, null, "Konten tentang belum tersedia", 200);
			}

			return successResponse(
				res,
				about,
				"Konten tentang berhasil diambil",
				200
			);
		} catch (error) {
			console.error("Error in getActiveAbout:", error);
			return errorResponse(res, error.message, 500);
		}
	}

	// Get all about contents (for admin)
	static async getAllAbouts(req, res) {
		try {
			const abouts = await About.findAll({
				order: [["updatedAt", "DESC"]],
			});

			return successResponse(
				res,
				abouts,
				"Semua konten tentang berhasil diambil",
				200
			);
		} catch (error) {
			console.error("Error in getAllAbouts:", error);
			return errorResponse(res, error.message, 500);
		}
	}

	// Get about by ID
	static async getAboutById(req, res) {
		try {
			const { id } = req.params;
			const about = await About.findByPk(id);

			if (!about) {
				return errorResponse(res, "Konten tentang tidak ditemukan", 404);
			}

			return successResponse(
				res,
				about,
				"Konten tentang berhasil diambil",
				200
			);
		} catch (error) {
			console.error("Error in getAboutById:", error);
			return errorResponse(res, error.message, 500);
		}
	}

	// Create about content
	static async createAbout(req, res) {
		try {
			const {
				historyTitle,
				historySubtitle,
				historyContent,
				visionTitle,
				visionContent,
				missionTitle,
				missionContent,
				philosophyTitle,
				philosophySubtitle,
				philosophyItems,
				managementTitle,
				managementSubtitle,
				managementMembers,
				isActive,
			} = req.body;

			// Validate required fields
			if (!historyContent) {
				return errorResponse(res, "Konten sejarah wajib diisi", 400);
			}

			// Parse JSON fields if they are strings
			let parsedMissionContent = missionContent;
			let parsedPhilosophyItems = philosophyItems;
			let parsedManagementMembers = managementMembers;

			if (typeof missionContent === "string") {
				try {
					parsedMissionContent = JSON.parse(missionContent);
				} catch (e) {
					parsedMissionContent = missionContent;
				}
			}

			if (typeof philosophyItems === "string") {
				try {
					parsedPhilosophyItems = JSON.parse(philosophyItems);
				} catch (e) {
					parsedPhilosophyItems = philosophyItems;
				}
			}

			if (typeof managementMembers === "string") {
				try {
					parsedManagementMembers = JSON.parse(managementMembers);
				} catch (e) {
					parsedManagementMembers = managementMembers;
				}
			}

			// If isActive is true, deactivate other about contents
			if (isActive === true || isActive === "true") {
				await About.update({ isActive: false }, { where: { isActive: true } });
			}

			const about = await About.create({
				historyTitle,
				historySubtitle,
				historyContent,
				visionTitle,
				visionContent,
				missionTitle,
				missionContent: parsedMissionContent,
				philosophyTitle,
				philosophySubtitle,
				philosophyItems: parsedPhilosophyItems,
				managementTitle,
				managementSubtitle,
				managementMembers: parsedManagementMembers,
				isActive: isActive === true || isActive === "true",
			});

			return successResponse(res, about, "Konten tentang berhasil dibuat", 201);
		} catch (error) {
			console.error("Error in createAbout:", error);
			return errorResponse(res, error.message, 500);
		}
	}

	// Update about content
	static async updateAbout(req, res) {
		try {
			const { id } = req.params;
			const {
				historyTitle,
				historySubtitle,
				historyContent,
				visionTitle,
				visionContent,
				missionTitle,
				missionContent,
				philosophyTitle,
				philosophySubtitle,
				philosophyItems,
				managementTitle,
				managementSubtitle,
				managementMembers,
				isActive,
			} = req.body;

			const about = await About.findByPk(id);

			if (!about) {
				return errorResponse(res, "Konten tentang tidak ditemukan", 404);
			}

			// Parse JSON fields if they are strings
			let parsedMissionContent = missionContent;
			let parsedPhilosophyItems = philosophyItems;
			let parsedManagementMembers = managementMembers;

			if (typeof missionContent === "string") {
				try {
					parsedMissionContent = JSON.parse(missionContent);
				} catch (e) {
					parsedMissionContent = missionContent;
				}
			}

			if (typeof philosophyItems === "string") {
				try {
					parsedPhilosophyItems = JSON.parse(philosophyItems);
				} catch (e) {
					parsedPhilosophyItems = philosophyItems;
				}
			}

			if (typeof managementMembers === "string") {
				try {
					parsedManagementMembers = JSON.parse(managementMembers);
				} catch (e) {
					parsedManagementMembers = managementMembers;
				}
			}

			// If isActive is true, deactivate other about contents
			if (isActive === true || isActive === "true") {
				await About.update(
					{ isActive: false },
					{
						where: {
							isActive: true,
							id: { [require("sequelize").Op.ne]: id },
						},
					}
				);
			}

			await about.update({
				historyTitle: historyTitle || about.historyTitle,
				historySubtitle:
					historySubtitle !== undefined
						? historySubtitle
						: about.historySubtitle,
				historyContent: historyContent || about.historyContent,
				visionTitle: visionTitle || about.visionTitle,
				visionContent:
					visionContent !== undefined ? visionContent : about.visionContent,
				missionTitle: missionTitle || about.missionTitle,
				missionContent:
					parsedMissionContent !== undefined
						? parsedMissionContent
						: about.missionContent,
				philosophyTitle: philosophyTitle || about.philosophyTitle,
				philosophySubtitle:
					philosophySubtitle !== undefined
						? philosophySubtitle
						: about.philosophySubtitle,
				philosophyItems:
					parsedPhilosophyItems !== undefined
						? parsedPhilosophyItems
						: about.philosophyItems,
				managementTitle: managementTitle || about.managementTitle,
				managementSubtitle:
					managementSubtitle !== undefined
						? managementSubtitle
						: about.managementSubtitle,
				managementMembers:
					parsedManagementMembers !== undefined
						? parsedManagementMembers
						: about.managementMembers,
				isActive:
					isActive !== undefined
						? isActive === true || isActive === "true"
						: about.isActive,
			});

			return successResponse(
				res,
				about,
				"Konten tentang berhasil diperbarui",
				200
			);
		} catch (error) {
			console.error("Error in updateAbout:", error);
			return errorResponse(res, error.message, 500);
		}
	}

	// Delete about content
	static async deleteAbout(req, res) {
		try {
			const { id } = req.params;

			const about = await About.findByPk(id);

			if (!about) {
				return errorResponse(res, "Konten tentang tidak ditemukan", 404);
			}

			await about.destroy();

			return successResponse(res, null, "Konten tentang berhasil dihapus", 200);
		} catch (error) {
			console.error("Error in deleteAbout:", error);
			return errorResponse(res, error.message, 500);
		}
	}

	// Toggle active status
	static async toggleActive(req, res) {
		try {
			const { id } = req.params;

			const about = await About.findByPk(id);

			if (!about) {
				return errorResponse(res, "Konten tentang tidak ditemukan", 404);
			}

			// If making this active, deactivate others
			if (!about.isActive) {
				await About.update({ isActive: false }, { where: { isActive: true } });
			}

			await about.update({
				isActive: !about.isActive,
			});

			return successResponse(
				res,
				about,
				`Konten tentang berhasil ${
					about.isActive ? "diaktifkan" : "dinonaktifkan"
				}`,
				200
			);
		} catch (error) {
			console.error("Error in toggleActive:", error);
			return errorResponse(res, error.message, 500);
		}
	}
}

module.exports = AboutController;
