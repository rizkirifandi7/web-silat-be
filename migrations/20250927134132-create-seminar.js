"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("Seminars", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			gambar: {
				type: Sequelize.TEXT,
			},
			judul: {
				type: Sequelize.TEXT,
			},
			deskripsi: {
				type: Sequelize.TEXT,
			},
			tanggal_mulai: {
				type: Sequelize.DATE,
			},
			tanggal_selesai: {
				type: Sequelize.DATE,
			},
			waktu_mulai: {
				type: Sequelize.TIME,
			},
			waktu_selesai: {
				type: Sequelize.TIME,
			},
			lokasi: {
				type: Sequelize.TEXT,
			},
			link_acara: {
				type: Sequelize.TEXT,
			},
			harga: {
				type: Sequelize.INTEGER,
			},
			kuota: {
				type: Sequelize.INTEGER,
			},
			status: {
				type: Sequelize.ENUM("Akan Datang", "Berlangsung", "Selesai"),
				defaultValue: "Akan Datang",
			},
			gambar_banner: {
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
		await queryInterface.dropTable("Seminars");
	},
};

