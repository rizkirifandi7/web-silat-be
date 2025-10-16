"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("Materis", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			id_course: {
				type: Sequelize.INTEGER,
			},
			judul: {
				type: Sequelize.STRING,
			},
			tipeKonten: {
				type: Sequelize.ENUM("video", "pdf"),
			},
			konten: {
				type: Sequelize.TEXT,
			},
			tingkatan: {
				type: Sequelize.ENUM(
					"Belum punya",
					"LULUS Binfistal",
					"Sabuk Putih",
					"Sabuk Kuning",
					"Sabuk Hijau",
					"Sabuk Merah",
					"Sabuk Hitam Wiraga 1",
					"Sabuk Hitam Wiraga 2",
					"Sabuk Hitam Wiraga 3"
				),
				allowNull: false,
			},
			deskripsi: {
				type: Sequelize.TEXT,
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
		await queryInterface.dropTable("Materis");
	},
};

