"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Materi extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			Materi.belongsTo(models.Course, {
				foreignKey: "id_course",
				as: "Course",
			});
		}
	}
	Materi.init(
		{
			id_course: DataTypes.INTEGER,
			judul: DataTypes.STRING,
			deskripsi: DataTypes.TEXT,
			tipeKonten: DataTypes.ENUM("video", "pdf"),
			konten: DataTypes.STRING,
			tingkatan: {
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
				allowNull: false,
			},
		},
		{
			sequelize,
			modelName: "Materi",
		}
	);
	return Materi;
};

