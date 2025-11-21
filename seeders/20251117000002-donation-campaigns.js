"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		// Insert sample campaigns
		const campaigns = await queryInterface.bulkInsert(
			"donation_campaigns",
			[
				{
					title: "Bantu Pembangunan Gedung Latihan Pencak Silat",
					slug: "bantu-pembangunan-gedung-latihan",
					description:
						"Mari bersama-sama membangun gedung latihan pencak silat untuk generasi muda Indonesia",
					full_description: `
          <p>Pencak Silat adalah warisan budaya Indonesia yang harus kita lestarikan. Untuk itu, kami membutuhkan gedung latihan yang layak agar para atlet muda dapat berlatih dengan maksimal.</p>
          
          <h3>Tujuan Penggalangan Dana:</h3>
          <ul>
            <li>Pembangunan gedung latihan dengan luas 500m²</li>
            <li>Pembelian matras dan peralatan latihan</li>
            <li>Fasilitas pendukung lainnya</li>
          </ul>
          
          <h3>Target Waktu:</h3>
          <p>Dana yang terkumpul akan digunakan untuk memulai pembangunan pada tahun 2025</p>
        `,
					category: "Pendidikan",
					target_amount: 500000000, // 500 juta
					collected_amount: 125000000, // 125 juta (25%)
					total_supporters: 150,
					start_date: new Date("2025-01-01"),
					end_date: new Date("2025-12-31"),
					status: "active",
					is_published: true,
					organizer_name: "Padepokan Pencak Silat Indonesia",
					organizer_description:
						"Organisasi yang fokus pada pelestarian dan pengembangan pencak silat di Indonesia",
					created_at: new Date(),
					updated_at: new Date(),
				},
				{
					title: "Beasiswa Atlet Pencak Silat Berprestasi",
					slug: "beasiswa-atlet-pencak-silat",
					description:
						"Dukung pendidikan atlet pencak silat berprestasi agar dapat melanjutkan sekolah sambil berlatih",
					full_description: `
          <p>Banyak atlet muda berbakat yang kesulitan melanjutkan pendidikan karena keterbatasan ekonomi. Mari kita bantu mereka!</p>
          
          <h3>Manfaat Donasi:</h3>
          <ul>
            <li>Biaya pendidikan untuk 20 atlet</li>
            <li>Biaya pelatihan dan kompetisi</li>
            <li>Perlengkapan sekolah dan latihan</li>
          </ul>
        `,
					category: "Pendidikan",
					target_amount: 200000000, // 200 juta
					collected_amount: 75000000, // 75 juta (37.5%)
					total_supporters: 89,
					start_date: new Date("2025-01-01"),
					end_date: new Date("2025-06-30"),
					status: "active",
					is_published: true,
					organizer_name: "Yayasan Pendidikan Pencak Silat",
					organizer_description:
						"Yayasan yang fokus pada pendidikan dan pembinaan atlet pencak silat",
					created_at: new Date(),
					updated_at: new Date(),
				},
				{
					title: "Pelatihan Pelatih Pencak Silat Nasional",
					slug: "pelatihan-pelatih-pencak-silat",
					description:
						"Program pelatihan intensif untuk pelatih pencak silat se-Indonesia",
					full_description: `
          <p>Pelatih berkualitas adalah kunci keberhasilan atlet. Mari dukung program pelatihan pelatih ini!</p>
          
          <h3>Program:</h3>
          <ul>
            <li>Workshop pelatihan selama 2 minggu</li>
            <li>Sertifikasi pelatih nasional</li>
            <li>Materi dan modul pelatihan</li>
          </ul>
        `,
					category: "Pendidikan",
					target_amount: 150000000, // 150 juta
					collected_amount: 45000000, // 45 juta (30%)
					total_supporters: 65,
					start_date: new Date("2025-02-01"),
					end_date: new Date("2025-07-31"),
					status: "active",
					is_published: true,
					organizer_name: "Ikatan Pelatih Pencak Silat Indonesia",
					organizer_description:
						"Organisasi profesi pelatih pencak silat Indonesia",
					created_at: new Date(),
					updated_at: new Date(),
				},
			],
			{ returning: true }
		);

		// Get campaign IDs (for MySQL, we need to query back)
		const campaignIds = [1, 2, 3]; // Assuming auto-increment starts at 1

		// Insert benefits for campaign 1
		await queryInterface.bulkInsert(
			"campaign_benefits",
			[
				{
					campaign_id: campaignIds[0],
					benefit_text:
						"Membangun fasilitas latihan yang layak untuk atlet muda",
					sort_order: 1,
					created_at: new Date(),
				},
				{
					campaign_id: campaignIds[0],
					benefit_text: "Meningkatkan prestasi pencak silat Indonesia",
					sort_order: 2,
					created_at: new Date(),
				},
				{
					campaign_id: campaignIds[0],
					benefit_text: "Melestarikan warisan budaya bangsa",
					sort_order: 3,
					created_at: new Date(),
				},
			],
			{}
		);

		// Insert benefits for campaign 2
		await queryInterface.bulkInsert(
			"campaign_benefits",
			[
				{
					campaign_id: campaignIds[1],
					benefit_text: "Membantu 20 atlet melanjutkan pendidikan",
					sort_order: 1,
					created_at: new Date(),
				},
				{
					campaign_id: campaignIds[1],
					benefit_text: "Menciptakan atlet yang cerdas dan berbakat",
					sort_order: 2,
					created_at: new Date(),
				},
				{
					campaign_id: campaignIds[1],
					benefit_text: "Investasi untuk masa depan olahraga Indonesia",
					sort_order: 3,
					created_at: new Date(),
				},
			],
			{}
		);

		// Insert benefits for campaign 3
		await queryInterface.bulkInsert(
			"campaign_benefits",
			[
				{
					campaign_id: campaignIds[2],
					benefit_text: "Meningkatkan kualitas pelatih se-Indonesia",
					sort_order: 1,
					created_at: new Date(),
				},
				{
					campaign_id: campaignIds[2],
					benefit_text: "Standarisasi metode pelatihan",
					sort_order: 2,
					created_at: new Date(),
				},
				{
					campaign_id: campaignIds[2],
					benefit_text: "Sertifikasi pelatih profesional",
					sort_order: 3,
					created_at: new Date(),
				},
			],
			{}
		);
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.bulkDelete("campaign_benefits", null, {});
		await queryInterface.bulkDelete("donation_campaigns", null, {});
	},
};
