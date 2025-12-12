"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		// Add urutan to Courses table
		await queryInterface.addColumn("Courses", "urutan", {
			type: Sequelize.INTEGER,
			allowNull: true,
			defaultValue: 0,
		});

		// Add urutan to Materis table
		await queryInterface.addColumn("Materis", "urutan", {
			type: Sequelize.INTEGER,
			allowNull: true,
			defaultValue: 0,
		});

		// Set initial urutan based on current createdAt order for Courses
		await queryInterface.sequelize.query(`
			WITH ranked_courses AS (
				SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt" ASC) as row_num
				FROM "Courses"
			)
			UPDATE "Courses"
			SET urutan = ranked_courses.row_num
			FROM ranked_courses
			WHERE "Courses".id = ranked_courses.id
		`);

		// Set initial urutan based on current order within each course for Materis
		await queryInterface.sequelize.query(`
			WITH ranked_materis AS (
				SELECT id, ROW_NUMBER() OVER (PARTITION BY id_course ORDER BY "createdAt" ASC) as row_num
				FROM "Materis"
			)
			UPDATE "Materis"
			SET urutan = ranked_materis.row_num
			FROM ranked_materis
			WHERE "Materis".id = ranked_materis.id
		`);
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.removeColumn("Courses", "urutan");
		await queryInterface.removeColumn("Materis", "urutan");
	},
};
