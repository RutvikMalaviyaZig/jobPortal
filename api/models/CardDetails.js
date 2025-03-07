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
      type: DataTypes.STRING,
    },
    isPaymentDone : {
        type: DataTypes.BOOLEAN,
        defaultValue : false,
    },
    cardId: {
      type: DataTypes.STRING,
    },
    cardExpYear: {
      type: DataTypes.NUMBER,
    },
    cardExpMonth: {
      type: DataTypes.NUMBER,
    },
    cardLast4Digit: {
      type: DataTypes.NUMBER,
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
