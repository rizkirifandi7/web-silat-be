"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
	class RefreshToken extends Model {
		static associate(models) {
			RefreshToken.belongsTo(models.Anggota, {
				foreignKey: "user_id",
				as: "user",
			});
		}
	}

	RefreshToken.init(
		{
			token: {
				type: DataTypes.STRING(500),
				allowNull: false,
				unique: true,
			},
			user_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			expires_at: {
				type: DataTypes.DATE,
				allowNull: false,
			},
			revoked: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
			ip_address: DataTypes.STRING(45),
			user_agent: DataTypes.TEXT,
			revoked_at: DataTypes.DATE,
		},
		{
			sequelize,
			modelName: "RefreshToken",
			tableName: "refresh_tokens",
			underscored: true,
			timestamps: true, // This will use created_at and updated_at
		}
	);

	return RefreshToken;
};
