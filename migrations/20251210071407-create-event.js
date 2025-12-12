"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("Events", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			title: {
				type: Sequelize.STRING,
			},
			description: {
				type: Sequelize.TEXT,
			},
			detailedDescription: {
				type: Sequelize.TEXT,
			},
			category: {
				type: Sequelize.STRING,
			},
			date: {
				type: Sequelize.DATE,
			},
			location: {
				type: Sequelize.STRING,
			},
			imageUrl: {
				type: Sequelize.TEXT,
			},
			maxParticipants: {
				type: Sequelize.INTEGER,
			},
			registeredParticipants: {
				type: Sequelize.INTEGER,
				defaultValue: 0,
			},
			registrationFee: {
				type: Sequelize.DECIMAL(10, 2),
			},
			agenda: {
				type: Sequelize.JSON,
			},
			speakers: {
				type: Sequelize.JSON,
			},
			facilities: {
				type: Sequelize.JSON,
			},
			requirements: {
				type: Sequelize.JSON,
			},
			contanctPerson: {
				type: Sequelize.JSON,
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
		await queryInterface.dropTable("Events");
	},
};

