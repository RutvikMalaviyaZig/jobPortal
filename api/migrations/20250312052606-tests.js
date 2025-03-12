'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */


    await queryInterface.createTable( "tests",
      {
        id: {
          type: Sequelize.UUID,
          allowNull: false,
          primaryKey: true,
          defaultValue: Sequelize.UUIDV4,
        },
        email: {
          type: Sequelize.STRING,
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
          type: Sequelize.STRING,
          allowNull: false,
        },
        stripeCustomerId : {
          type : Sequelize.STRING,
          defaultValue : " "
        },
        startDate: {
            type: Sequelize.DATE,
            allowNull: false,
          },
          endDate: {
            type: Sequelize.DATE,
            allowNull: false,
          },
          amountPerHr: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          
      },
      {
        freezeTableName: true,
        tableName: "users",
        timestamps: true,
        paranoid: true,
      })
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable('tests');
  }
};
