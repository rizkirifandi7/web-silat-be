"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("Abouts", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			// Sejarah Section
			historyTitle: {
				type: Sequelize.STRING,
				allowNull: false,
				defaultValue: "Sejarah Perguruan",
			},
			historySubtitle: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			historyContent: {
				type: Sequelize.TEXT,
				allowNull: false,
			},
			// Visi & Misi
			visionTitle: {
				type: Sequelize.STRING,
				defaultValue: "Visi",
			},
			visionContent: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			missionTitle: {
				type: Sequelize.STRING,
				defaultValue: "Misi",
			},
			missionContent: {
				type: Sequelize.JSON,
				allowNull: true,
			},
			// Philosophy (Filosofi Lambang)
			philosophyTitle: {
				type: Sequelize.STRING,
				defaultValue: "Filosofi Lambang PUSAMADA",
			},
			philosophySubtitle: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			philosophyItems: {
				type: Sequelize.JSON,
				allowNull: true,
			},
			// Management Structure (Kepengurusan)
			managementTitle: {
				type: Sequelize.STRING,
				defaultValue: "Struktur Kepengurusan",
			},
			managementSubtitle: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			managementMembers: {
				type: Sequelize.JSON,
				allowNull: true,
			},
			isActive: {
				type: Sequelize.BOOLEAN,
				defaultValue: true,
			},
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE,
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE,
			},
		});
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable("Abouts");
	},
};
