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
			Course.hasMany(models.Materi, {
				foreignKey: "id_course",
				onDelete: "CASCADE",
				hooks: true,
			});
		}
	}
	Course.init(
		{
			judul: DataTypes.STRING,
			deskripsi: DataTypes.TEXT,
			urutan: {
				type: DataTypes.INTEGER,
				allowNull: true,
				defaultValue: 0,
			},
			tingkatan_sabuk: {
				type: DataTypes.ENUM(
					"Belum punya",
					"LULUS Binfistal",
					"Sabuk Putih",
					"Sabuk Kuning",
					"Sabuk Hijau",
					"Sabuk Merah",
					"Sabuk Hitam Wiraga 1",
					"Sabuk Hitam Wiraga 2",
					"Sabuk Hitam Wiraga 3"
				),
				allowNull: true,
				defaultValue: null,
			},
		},
		{
			sequelize,
			modelName: "Course",
		}
	);
	return Course;
};

