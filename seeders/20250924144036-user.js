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
					nama: "Ike Ineke Suwanda",
					email: "ike.ineke.suwanda@example.com",
					password: hashedPassword,
					role: "anggota",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				// 3. Anggota
				{
					nama: "E. Tholib",
					email: "e.tholib@example.com",
					password: hashedPassword,
					role: "anggota",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				// 4. Anggota
				{
					nama: "Moh. Ramdhan",
					email: "moh.ramdhan@example.com",
					password: hashedPassword,
					role: "anggota",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				// 5. Anggota
				{
					nama: "Ratih Komalasari",
					email: "ratih.komalasari@example.com",
					password: hashedPassword,
					role: "anggota",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				// 6. Anggota
				{
					nama: "Rifki Fajari Supriatna",
					email: "rifki.fajari.supriatna@example.com",
					password: hashedPassword,
					role: "anggota",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				// 7. Anggota
				{
					nama: "Yogi Nugraha",
					email: "yogi.nugraha@example.com",
					password: hashedPassword,
					role: "anggota",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				// 8. Anggota
				{
					nama: "M. Rafi Ramadhan",
					email: "m.rafi.ramadhan@example.com",
					password: hashedPassword,
					role: "anggota",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				// 9. Anggota
				{
					nama: "Adinda Dara Sentifa",
					email: "adinda.dara.sentifa@example.com",
					password: hashedPassword,
					role: "anggota",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				// 10. Anggota
				{
					nama: "Rizky Muhammad Sujaya",
					email: "rizky.muhammad.sujaya@example.com",
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

