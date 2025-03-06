"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");
const CardDetails = require("./CardDetails");

const Payment = sequelize.define(
  "payments",
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    userId: {
      type: DataTypes.UUID,
      references: {
        model: "users",
        key: "id",
      },
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        notNull: {
          msg: "email is required",
        },
        notEmpty: {
          msg: "email is required",
        },
        isEmail: {
          msg: "Invalid email",
        },
      },
    },
    isPaymentDone : {
        type: DataTypes.BOOLEAN,
        defaultValue : false,
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
    tableName: "payments",
    timestamps: true,
    paranoid: true,
  }
);

Payment.hasMany(CardDetails, {
  foreignKey : "paymentId"
})
CardDetails.hasMany(Payment, {
  foreignKey : "paymentId"
})

module.exports = Payment;
