"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Course extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			Course.hasMany(models.Materi, { foreignKey: "id_course" });
		}
	}
	Course.init(
		{
			judul: DataTypes.STRING,
			deskripsi: DataTypes.TEXT,
		},
		{
			sequelize,
			modelName: "Course",
		}
	);
	return Course;
};

