"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("Orders", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			namaPembeli: {
				type: Sequelize.STRING,
			},
			email: {
				type: Sequelize.STRING,
			},
			alamat: {
				type: Sequelize.TEXT,
			},
			noTelepon: {
				type: Sequelize.STRING,
			},
			totalHarga: {
				type: Sequelize.DECIMAL,
			},
			statusPembayaran: {
				type: Sequelize.ENUM("pending", "paid", "failed"),
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
		await queryInterface.dropTable("Orders");
	},
};
