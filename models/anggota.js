"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Anggota extends Model {
		static associate(models) {
			// No associations currently
			// NOTE: Donation association removed because donations table doesn't have user_id column
			// Donations are made by anonymous/public donors (using donor_name, donor_email fields)
			// If you need user-based donations in the future, add user_id column to donations table first
		}
	}
	Anggota.init(
		{
			nama: DataTypes.STRING,
			email: DataTypes.STRING,
			password: DataTypes.STRING,
			role: DataTypes.ENUM("superadmin", "admin", "anggota"),
			id_token: DataTypes.STRING,
			tempat_lahir: DataTypes.STRING,
			tanggal_lahir: DataTypes.DATE,
			jenis_kelamin: DataTypes.STRING,
			alamat: DataTypes.TEXT,
			agama: DataTypes.STRING,
			no_telepon: DataTypes.STRING,
			angkatan_unit: DataTypes.STRING,
			status_keanggotaan: DataTypes.STRING,
			status_perguruan: DataTypes.STRING,
			tingkatan_sabuk: DataTypes.STRING,
			foto: DataTypes.TEXT,
		},
		{
			sequelize,
			modelName: "Anggota",
		}
	);
	return Anggota;
};
