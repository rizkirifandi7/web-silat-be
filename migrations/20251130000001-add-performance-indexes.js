"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		// Add index for checking user registration on specific event
		// This will speed up the checkRegistration query significantly
		await queryInterface.addIndex("Registrations", ["user_id", "event_id"], {
			name: "idx_registrations_user_event",
			unique: false,
		});

		// Add index for filtering registrations by status
		// Used in getEventById when filtering confirmed registrations
		await queryInterface.addIndex("Registrations", ["status"], {
			name: "idx_registrations_status",
			unique: false,
		});

		// Composite index for event queries with status and date
		// Useful for filtering and sorting events
		await queryInterface.addIndex("Events", ["status", "start_date"], {
			name: "idx_events_status_date",
			unique: false,
		});

		// Index for event_id in registrations (for faster joins)
		await queryInterface.addIndex("Registrations", ["event_id"], {
			name: "idx_registrations_event_id",
			unique: false,
		});

		console.log("Performance indexes added successfully!");
	},

	async down(queryInterface, Sequelize) {
		// Remove indexes in reverse order
		await queryInterface.removeIndex(
			"Registrations",
			"idx_registrations_user_event"
		);
		await queryInterface.removeIndex(
			"Registrations",
			"idx_registrations_status"
		);
		await queryInterface.removeIndex("Events", "idx_events_status_date");
		await queryInterface.removeIndex(
			"Registrations",
			"idx_registrations_event_id"
		);

		console.log("Performance indexes removed successfully!");
	},
};
