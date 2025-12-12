"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn("Courses", "tingkatan_sabuk", {
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
			allowNull: true,
			defaultValue: null,
		});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.removeColumn("Courses", "tingkatan_sabuk");
	},
};

