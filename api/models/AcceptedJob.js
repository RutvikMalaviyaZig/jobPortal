"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

const AcceptedJob = sequelize.define(
  "acceptedJob",
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
      references: {
        model: "jobs",
        key: "startDate",
      },
    },
    endDate: {
      type: DataTypes.DATE,
      references: {
        model: "jobs",
        key: "endDate",
      },
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
    tableName: "acceptedJob",
    timestamps: true,
    paranoid: true,
  }
);

module.exports = AcceptedJob;
