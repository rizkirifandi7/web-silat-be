"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("OrderItems", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			idOrder: {
				type: Sequelize.INTEGER,
				references: {
					model: "Orders",
					key: "id",
				},
				onUpdate: "CASCADE",
				onDelete: "CASCADE",
			},
			idKatalog: {
				type: Sequelize.INTEGER,
				references: {
					model: "Katalogs",
					key: "id",
				},
				onUpdate: "CASCADE",
				onDelete: "CASCADE",
			},
			jumlah: {
				type: Sequelize.INTEGER,
			},
			hargaSatuan: {
				type: Sequelize.DECIMAL,
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
		await queryInterface.dropTable("OrderItems");
	},
};
