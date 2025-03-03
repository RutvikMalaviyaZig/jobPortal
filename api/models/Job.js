"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");
const User = require("./User");
const JobApplicant = require("./JobApplicant");
const AcceptedJob = require("./AcceptedJob");

const Job = sequelize.define(
  "jobs",
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
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
      type: DataTypes.INTEGER,
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
    isAccepted: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
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
    tableName: "jobs",
    timestamps: true,
    paranoid: true,
  }
);


Job.hasMany(JobApplicant, {
  foreignKey : "jobId"
})

JobApplicant.belongsTo(Job, {
  foreignKey : "jobId"
})

Job.hasOne(AcceptedJob, {
   foreignKey : "jobId"
})

User.belongsTo(Job, {
  foreignKey: "id",
});



module.exports = Job;
