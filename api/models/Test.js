"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");
const JobApplicant = require("./JobApplicant");


const User = sequelize.define(
  "users",
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
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
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    stripeCustomerId : {
      type : DataTypes.STRING,
      defaultValue : " "
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      amountPerHr: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      startTime: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      endTime: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
  
      totalAmount: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      jobStatus : {
        type : DataTypes.STRING,
        defaultValue : "panding"
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
    tableName: "users",
    timestamps: true,
    paranoid: true,
  }
);

User.hasMany(JobApplicant, { foreignKey: 'userId' });
JobApplicant.belongsTo(User, { foreignKey: 'userId' });


module.exports = User;
