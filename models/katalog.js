"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Katalog extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			Katalog.hasMany(models.OrderItem, {
				foreignKey: "id_katalog",
				as: "orderItems",
			});
		}
	}
	Katalog.init(
		{
			namaBarang: DataTypes.STRING,
			deskripsi: DataTypes.TEXT,
			gambar: DataTypes.STRING,
			harga: DataTypes.DECIMAL,
			status: DataTypes.ENUM("tersedia", "habis"),
		},
		{
			sequelize,
			modelName: "Katalog",
		}
	);
	return Katalog;
};
