"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("Anggota", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			id_token: {
				type: Sequelize.STRING,
			},
			nama_lengkap: {
				type: Sequelize.STRING,
			},
			nama_panggilan: {
				type: Sequelize.STRING,
			},
			email: {
				type: Sequelize.STRING,
			},
			tempat_lahir: {
				type: Sequelize.STRING,
			},
			tanggal_lahir: {
				type: Sequelize.DATE,
			},
			jenis_kelamin: {
				type: Sequelize.STRING,
			},
			alamat: {
				type: Sequelize.TEXT,
			},
			no_telepon: {
				type: Sequelize.STRING,
			},
			agama: {
				type: Sequelize.STRING,
			},
			angkatan_unit: {
				type: Sequelize.STRING,
			},
			foto: {
				type: Sequelize.STRING,
			},
			status_keanggotaan: {
				type: Sequelize.STRING,
			},
			status_perguruan: {
				type: Sequelize.STRING,
			},
			tingkatan_sabuk: {
				type: Sequelize.STRING,
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
		await queryInterface.dropTable("Anggota");
	},
};

