"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Event extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
		}
	}
	Event.init(
		{
			title: {
				type: DataTypes.STRING,
			},	
			description: {
				type: DataTypes.TEXT,
			},
			detailedDescription: {
				type: DataTypes.TEXT,
			},
			category: {
				type: DataTypes.STRING,
			},
			date: {
				type: DataTypes.DATE,
			},
			location: {
				type: DataTypes.STRING,
			},
			imageUrl: {
				type: DataTypes.TEXT,
			},
			maxParticipants: {
				type: DataTypes.INTEGER,
			},
			registeredParticipants: {
				type: DataTypes.INTEGER,
				defaultValue: 0,
			},
			registrationFee: {
				type: DataTypes.DECIMAL(10, 2),
			},
			agenda: {
				type: DataTypes.JSON,
			},
			speakers: {
				type: DataTypes.JSON,
			},
			facilities: {
				type: DataTypes.JSON,
			},
			requirements: {
				type: DataTypes.JSON,
			},
			contanctPerson: {
				type: DataTypes.JSON,
			},
			isActive: {
				type: DataTypes.BOOLEAN,
				defaultValue: true,
			},
		},
		{
			sequelize,
			modelName: "Event",
		}
	);
	return Event;
};

