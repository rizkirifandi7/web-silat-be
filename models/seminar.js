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
			tanggal_mulai: DataTypes.DATE,
			tanggal_selesai: DataTypes.DATE,
			waktu_mulai: DataTypes.TIME,
			waktu_selesai: DataTypes.TIME,
			lokasi: DataTypes.TEXT,
			link_acara: DataTypes.TEXT,
			harga: DataTypes.INTEGER,
			kuota: DataTypes.INTEGER,
			status: DataTypes.ENUM("Akan Datang", "Berlangsung", "Selesai"),
			gambar_banner: DataTypes.TEXT,
		},
		{
			sequelize,
			modelName: "Seminar",
		}
	);
	return Seminar;
};
