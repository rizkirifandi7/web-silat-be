"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Anggota extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
		}
	}
	Anggota.init(
		{
			id_token: DataTypes.STRING,
			nama_lengkap: DataTypes.STRING,
			nama_panggilan: DataTypes.STRING,
			email: DataTypes.STRING,
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
			foto: DataTypes.STRING,
		},
		{
			sequelize,
			modelName: "Anggota",
		}
	);
	return Anggota;
};

