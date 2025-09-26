"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class User extends Model {
		static associate(models) {
			// define association here
			User.hasOne(models.Anggota, { foreignKey: "id_user", as: "anggota" });
		}
	}
	User.init(
		{
			nama: DataTypes.STRING,
			email: DataTypes.STRING,
			password: DataTypes.STRING,
			role: DataTypes.ENUM("admin", "anggota"),
		},
		{
			sequelize,
			modelName: "User",
		}
	);
	return User;
};

