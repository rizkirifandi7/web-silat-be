"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		// Add urgency_level column
		await queryInterface.addColumn("donation_campaigns", "urgency_level", {
			type: Sequelize.STRING(50),
			defaultValue: "medium",
			after: "end_date",
		});

		// Add is_urgent column
		await queryInterface.addColumn("donation_campaigns", "is_urgent", {
			type: Sequelize.BOOLEAN,
			defaultValue: false,
			after: "urgency_level",
		});

		// Add index for urgency_level
		await queryInterface.addIndex("donation_campaigns", ["urgency_level"]);
	},

	down: async (queryInterface, Sequelize) => {
		// Remove index
		await queryInterface.removeIndex("donation_campaigns", ["urgency_level"]);

		// Remove columns
		await queryInterface.removeColumn("donation_campaigns", "is_urgent");
		await queryInterface.removeColumn("donation_campaigns", "urgency_level");
	},
};
