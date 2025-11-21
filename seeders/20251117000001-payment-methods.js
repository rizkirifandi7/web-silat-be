"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.bulkInsert(
			"payment_methods",
			[
				// Bank Transfer
				{
					name: "BCA Virtual Account",
					channel: "bank_transfer",
					midtrans_code: "bca_va",
					description: "Transfer via Virtual Account BCA",
					admin_fee_type: "fixed",
					admin_fee_value: 4000,
					is_active: true,
					sort_order: 1,
					created_at: new Date(),
				},
				{
					name: "BNI Virtual Account",
					channel: "bank_transfer",
					midtrans_code: "bni_va",
					description: "Transfer via Virtual Account BNI",
					admin_fee_type: "fixed",
					admin_fee_value: 4000,
					is_active: true,
					sort_order: 2,
					created_at: new Date(),
				},
				{
					name: "BRI Virtual Account",
					channel: "bank_transfer",
					midtrans_code: "bri_va",
					description: "Transfer via Virtual Account BRI",
					admin_fee_type: "fixed",
					admin_fee_value: 4000,
					is_active: true,
					sort_order: 3,
					created_at: new Date(),
				},
				{
					name: "Mandiri Bill Payment",
					channel: "bank_transfer",
					midtrans_code: "echannel",
					description: "Transfer via Mandiri Bill Payment",
					admin_fee_type: "fixed",
					admin_fee_value: 4000,
					is_active: true,
					sort_order: 4,
					created_at: new Date(),
				},
				{
					name: "Permata Virtual Account",
					channel: "bank_transfer",
					midtrans_code: "permata_va",
					description: "Transfer via Virtual Account Permata",
					admin_fee_type: "fixed",
					admin_fee_value: 4000,
					is_active: true,
					sort_order: 5,
					created_at: new Date(),
				},

				// E-Wallet
				{
					name: "GoPay",
					channel: "ewallet",
					midtrans_code: "gopay",
					description: "Bayar dengan GoPay",
					admin_fee_type: "percentage",
					admin_fee_value: 2,
					is_active: true,
					sort_order: 10,
					created_at: new Date(),
				},
				{
					name: "ShopeePay",
					channel: "ewallet",
					midtrans_code: "shopeepay",
					description: "Bayar dengan ShopeePay",
					admin_fee_type: "percentage",
					admin_fee_value: 2,
					is_active: true,
					sort_order: 11,
					created_at: new Date(),
				},
				{
					name: "QRIS",
					channel: "qris",
					midtrans_code: "qris",
					description: "Bayar dengan QRIS (semua e-wallet)",
					admin_fee_type: "percentage",
					admin_fee_value: 0.7,
					is_active: true,
					sort_order: 12,
					created_at: new Date(),
				},

				// Credit Card
				{
					name: "Kartu Kredit/Debit",
					channel: "credit_card",
					midtrans_code: "credit_card",
					description: "Bayar dengan Kartu Kredit atau Debit",
					admin_fee_type: "percentage",
					admin_fee_value: 2.9,
					is_active: true,
					sort_order: 20,
					created_at: new Date(),
				},

				// Convenience Store
				{
					name: "Indomaret",
					channel: "convenience_store",
					midtrans_code: "cstore",
					description: "Bayar di Indomaret",
					admin_fee_type: "fixed",
					admin_fee_value: 5000,
					is_active: true,
					sort_order: 30,
					created_at: new Date(),
				},
				{
					name: "Alfamart",
					channel: "convenience_store",
					midtrans_code: "cstore",
					description: "Bayar di Alfamart",
					admin_fee_type: "fixed",
					admin_fee_value: 5000,
					is_active: true,
					sort_order: 31,
					created_at: new Date(),
				},
			],
			{}
		);
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.bulkDelete("payment_methods", null, {});
	},
};
