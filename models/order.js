"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Order extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			Order.hasMany(models.OrderItem, {
				foreignKey: "id_order",
				as: "orderItems",
			});
		}
	}
	Order.init(
		{
			namaPembeli: DataTypes.STRING,
			email: DataTypes.STRING,
			alamat: DataTypes.TEXT,
			noTelepon: DataTypes.STRING,
			totalHarga: DataTypes.DECIMAL,
			statusPembayaran: DataTypes.ENUM("pending", "paid", "failed"),
		},
		{
			sequelize,
			modelName: "Order",
		}
	);
	return Order;
};
