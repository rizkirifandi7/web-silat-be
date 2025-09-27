"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Seminar extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
		}
	}
	Seminar.init(
		{
			gambar: DataTypes.TEXT,
			judul: DataTypes.TEXT,
			deskripsi: DataTypes.TEXT,
		},
		{
			sequelize,
			modelName: "Seminar",
		}
	);
	return Seminar;
};
