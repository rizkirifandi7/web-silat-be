"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("Katalogs", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			namaBarang: {
				type: Sequelize.STRING,
			},
			deskripsi: {
				type: Sequelize.TEXT,
			},
			gambar: {
				type: Sequelize.STRING,
			},
			harga: {
				type: Sequelize.DECIMAL,
			},
			status: {
				type: Sequelize.ENUM("tersedia", "habis"),
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
		await queryInterface.dropTable("Katalogs");
	},
};

