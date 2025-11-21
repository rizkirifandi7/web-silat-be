"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("donation_campaigns", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			title: {
				type: Sequelize.STRING(255),
				allowNull: false,
			},
			slug: {
				type: Sequelize.STRING(255),
				allowNull: false,
				unique: true,
			},
			description: {
				type: Sequelize.TEXT,
			},
			full_description: {
				type: Sequelize.TEXT,
			},
			image_url: {
				type: Sequelize.TEXT,
			},
			category: {
				type: Sequelize.STRING(100),
			},
			target_amount: {
				type: Sequelize.DECIMAL(15, 2),
				allowNull: false,
			},
			collected_amount: {
				type: Sequelize.DECIMAL(15, 2),
				defaultValue: 0,
			},
			total_supporters: {
				type: Sequelize.INTEGER,
				defaultValue: 0,
			},
			start_date: {
				type: Sequelize.DATE,
				allowNull: false,
			},
			end_date: {
				type: Sequelize.DATE,
				allowNull: false,
			},
			status: {
				type: Sequelize.STRING(50),
				defaultValue: "active",
			},
			is_published: {
				type: Sequelize.BOOLEAN,
				defaultValue: false,
			},
			organizer_name: {
				type: Sequelize.STRING(255),
			},
			organizer_image_url: {
				type: Sequelize.TEXT,
			},
			organizer_description: {
				type: Sequelize.TEXT,
			},
			created_by: {
				type: Sequelize.INTEGER,
			},
			created_at: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
			},
			updated_at: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
			},
		});

		// Add indexes
		await queryInterface.addIndex("donation_campaigns", ["status"]);
		await queryInterface.addIndex("donation_campaigns", ["category"]);
		await queryInterface.addIndex("donation_campaigns", ["end_date"]);
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable("donation_campaigns");
	},
};
