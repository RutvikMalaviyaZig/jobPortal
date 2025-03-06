"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

const CardDetails = sequelize.define(
  "carddetails",
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    paymentId: {
      type: DataTypes.UUID,
      references: {
        model: "payments",
        key: "id",
      },
    },
    cardId: {
      type: DataTypes.STRING,
    },
    cardExpYear: {
      type: DataTypes.NUMBER(4),
    },
    cardExpMonth: {
      type: DataTypes.NUMBER(2),
    },
    cardLast4Digit: {
      type: DataTypes.NUMBER(12),
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    deletedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    freezeTableName: true,
    tableName: "carddetails",
    timestamps: true,
    paranoid: true,
  }
);

module.exports = CardDetails;
