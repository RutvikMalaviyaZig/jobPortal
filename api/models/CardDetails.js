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
    isPaymentDone: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      references: {
        model: "payments",
        key: "isPaymentDone",
      },
    },
    paymentId: {
      type: DataTypes.UUID,
      references: {
        model: "payments",
        key: "id",
      },
    },
    cardHolderName: {
      type: DataTypes.STRING,
    },
    cardExpYear: {
      type: DataTypes.NUMBER(4),
    },
    cardExpMonth: {
      type: DataTypes.NUMBER(2),
    },
    cardNumber: {
      type: DataTypes.NUMBER(12),
    },
    cardCVV: {
      type: DataTypes.NUMBER(3),
    },
    cardToken : {
      type: DataTypes.STRING,
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
