"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("refresh_tokens", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			token: {
				type: Sequelize.STRING(500),
				allowNull: false,
				unique: true,
			},
			user_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				references: {
					model: "Anggota",
					key: "id",
				},
				onUpdate: "CASCADE",
				onDelete: "CASCADE",
			},
			expires_at: {
				type: Sequelize.DATE,
				allowNull: false,
			},
			revoked: {
				type: Sequelize.BOOLEAN,
				defaultValue: false,
			},
			ip_address: {
				type: Sequelize.STRING(45),
			},
			user_agent: {
				type: Sequelize.TEXT,
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
			revoked_at: {
				type: Sequelize.DATE,
			},
		});

		// Add indexes for performance
		await queryInterface.addIndex("refresh_tokens", ["user_id"]);
		await queryInterface.addIndex("refresh_tokens", ["token"]);
		await queryInterface.addIndex("refresh_tokens", ["expires_at"]);
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable("refresh_tokens");
	},
};

