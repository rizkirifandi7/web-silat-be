"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Anggota extends Model {
		static associate(models) {
			// define association here
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

