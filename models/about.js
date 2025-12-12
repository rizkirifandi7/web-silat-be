"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class About extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
		}
	}
	About.init(
		{
			// Sejarah Section
			historyTitle: {
				type: DataTypes.STRING,
				allowNull: false,
				defaultValue: "Sejarah Perguruan",
			},
			historySubtitle: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
			historyContent: {
				type: DataTypes.TEXT,
				allowNull: false,
			},
			// Visi & Misi
			visionTitle: {
				type: DataTypes.STRING,
				defaultValue: "Visi",
			},
			visionContent: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
			missionTitle: {
				type: DataTypes.STRING,
				defaultValue: "Misi",
			},
			missionContent: {
				type: DataTypes.JSON,
				allowNull: true,
				get() {
					const rawValue = this.getDataValue("missionContent");
					if (typeof rawValue === "string") {
						try {
							return JSON.parse(rawValue);
						} catch (e) {
							return rawValue;
						}
					}
					return rawValue;
				},
			},
			// Philosophy (Filosofi Lambang)
			philosophyTitle: {
				type: DataTypes.STRING,
				defaultValue: "Filosofi Lambang PUSAMADA",
			},
			philosophySubtitle: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
			philosophyItems: {
				type: DataTypes.JSON,
				allowNull: true,
				get() {
					const rawValue = this.getDataValue("philosophyItems");
					if (typeof rawValue === "string") {
						try {
							return JSON.parse(rawValue);
						} catch (e) {
							return rawValue;
						}
					}
					return rawValue;
				},
			},
			// Management Structure (Kepengurusan)
			managementTitle: {
				type: DataTypes.STRING,
				defaultValue: "Struktur Kepengurusan",
			},
			managementSubtitle: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
			managementMembers: {
				type: DataTypes.JSON,
				allowNull: true,
				get() {
					const rawValue = this.getDataValue("managementMembers");
					if (typeof rawValue === "string") {
						try {
							return JSON.parse(rawValue);
						} catch (e) {
							return rawValue;
						}
					}
					return rawValue;
				},
			},
			isActive: {
				type: DataTypes.BOOLEAN,
				defaultValue: true,
			},
		},
		{
			sequelize,
			modelName: "About",
		}
	);
	return About;
};
