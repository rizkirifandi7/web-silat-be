"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class OrderItem extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			OrderItem.belongsTo(models.Order, { foreignKey: "idOrder", as: "order" });
			OrderItem.belongsTo(models.Katalog, {
				foreignKey: "idKatalog",
				as: "katalog",
			});
		}
	}
	OrderItem.init(
		{
			idOrder: DataTypes.INTEGER,
			idKatalog: DataTypes.INTEGER,
			jumlah: DataTypes.INTEGER,
			hargaSatuan: DataTypes.DECIMAL,
		},
		{
			sequelize,
			modelName: "OrderItem",
		}
	);
	return OrderItem;
};
