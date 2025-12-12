"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.bulkInsert(
			"Abouts",
			[
				{
					historyTitle: "Sejarah Perguruan",
					historySubtitle:
						"Perjalanan PUSAMADA dari awal berdiri hingga saat ini.",
					historyContent:
						"Didirikan pada tahun 1980-an, Perguruan Pencak Silat Pusaka Mande Muda (PUSAMADA) lahir dari semangat untuk melestarikan aliran silat tradisional yang kaya akan nilai filosofis. Para pendiri, yang merupakan murid langsung dari para maestro silat terdahulu, merasa terpanggil untuk memastikan bahwa ilmu dan kearifan yang mereka terima tidak lekang oleh waktu.\n\nDengan berlandaskan pada ajaran luhur para guru, PUSAMADA berkembang dari sebuah kelompok latihan kecil menjadi sebuah organisasi yang terstruktur. Fokus utama kami tidak hanya pada aspek fisik bela diri, tetapi juga pada pembentukan karakter, disiplin, dan rasa cinta tanah air yang mendalam bagi setiap anggotanya.",
					visionTitle: "Visi",
					visionContent:
						"Menjadi pusat pelestarian dan pengembangan Pencak Silat yang menghasilkan pesilat berkarakter luhur, berprestasi, dan berjiwa nasionalis.",
					missionTitle: "Misi",
					missionContent: JSON.stringify([
						"Melestarikan nilai-nilai asli Pencak Silat sebagai warisan budaya.",
						"Membentuk karakter anggota yang disiplin, hormat, dan bertanggung jawab.",
						"Mencetak atlet berprestasi di tingkat nasional dan internasional.",
						"Menjadi wadah positif bagi generasi muda untuk berkembang.",
					]),
					philosophyTitle: "Filosofi Lambang PUSAMADA",
					philosophySubtitle:
						"Setiap elemen dalam lambang kami memiliki makna mendalam yang menjadi fondasi ajaran perguruan.",
					philosophyItems: JSON.stringify([
						{
							title: "Bintang",
							description: "Petunjuk dan Ilmu Pengetahuan.",
						},
						{
							title: "Kujang & Keris",
							description: "Pertahanan Diri dan Warisan Guru.",
						},
						{
							title: "Bendera Merah Putih",
							description: "Jiwa Nasionalisme.",
						},
						{
							title: "Segi Lima",
							description: "Panca Darma Pesilat.",
						},
						{
							title: "Lingkaran Putih",
							description: "Sumber Asal dan Kesucian Hati.",
						},
						{
							title: "Tiga Daun",
							description: "Tiga Tuntunan Hidup (Tri Tangtu).",
						},
					]),
					managementTitle: "Struktur Kepengurusan",
					managementSubtitle:
						"Orang-orang di balik layar yang berdedikasi memajukan PUSAMADA.",
					managementMembers: JSON.stringify([
						{
							nama: "Nama Lengkap",
							jabatan: "Ketua Umum",
							fotoUrl: "https://placehold.co/400x400/27272a/fafafa?text=Foto",
						},
						{
							nama: "Nama Lengkap",
							jabatan: "Wakil Ketua",
							fotoUrl: "https://placehold.co/400x400/27272a/fafafa?text=Foto",
						},
						{
							nama: "Nama Lengkap",
							jabatan: "Sekretaris",
							fotoUrl: "https://placehold.co/400x400/27272a/fafafa?text=Foto",
						},
						{
							nama: "Nama Lengkap",
							jabatan: "Bendahara",
							fotoUrl: "https://placehold.co/400x400/27272a/fafafa?text=Foto",
						},
					]),
					isActive: true,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			],
			{}
		);
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete("Abouts", null, {});
	},
};
