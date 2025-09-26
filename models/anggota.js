"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Anggota extends Model {
		static associate(models) {
			// define association here
			Anggota.belongsTo(models.User, { foreignKey: "id_user", as: "user" });
		}
	}
	Anggota.init(
		{
			id_user: DataTypes.INTEGER,
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
			foto: DataTypes.STRING,
		},
		{
			sequelize,
			modelName: "Anggota",
		}
	);
	return Anggota;
};

