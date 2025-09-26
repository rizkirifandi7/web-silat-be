"use strict";
const bcrypt = require("bcrypt");

module.exports = {
	async up(queryInterface, Sequelize) {
		const hashedPassword = await bcrypt.hash("password123", 10);

		await queryInterface.bulkInsert(
			"Users",
			[
				// 1. Admin
				{
					nama: "Admin Utama",
					email: "admin@test.com",
					password: bcrypt.hashSync("admin123", 10),
					role: "admin",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				// 2. Anggota
				{
					nama: "Citra Lestari",
					email: "citra.lestari@example.com",
					password: hashedPassword,
					role: "anggota",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				// 3. Anggota
				{
					nama: "Doni Firmansyah",
					email: "doni.firmansyah@example.com",
					password: hashedPassword,
					role: "anggota",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				// 4. Anggota
				{
					nama: "Eka Putri",
					email: "eka.putri@example.com",
					password: hashedPassword,
					role: "anggota",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				// 5. Anggota
				{
					nama: "Fajar Nugroho",
					email: "fajar.nugroho@example.com",
					password: hashedPassword,
					role: "anggota",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				// 6. Anggota
				{
					nama: "Gita Wulandari",
					email: "gita.wulandari@example.com",
					password: hashedPassword,
					role: "anggota",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				// 7. Anggota
				{
					nama: "Hendra Wijaya",
					email: "hendra.wijaya@example.com",
					password: hashedPassword,
					role: "anggota",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				// 8. Anggota
				{
					nama: "Indah Permata",
					email: "indah.permata@example.com",
					password: hashedPassword,
					role: "anggota",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				// 9. Anggota
				{
					nama: "Joko Susilo",
					email: "joko.susilo@example.com",
					password: hashedPassword,
					role: "anggota",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			],
			{}
		);
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete("Users", null, {});
	},
};

