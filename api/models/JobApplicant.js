"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

const JobApplicant = sequelize.define(
  "jobApplicant",
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
    jobId: {
      type: DataTypes.UUID,
      references: {
        model: "jobs",
        key: "id",
      },
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
    tableName: "jobApplicant",
    timestamps: true,
    paranoid: true,
  }
);



module.exports = JobApplicant;
