'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('Menus', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            price: {
                allowNull: false,
                type: Sequelize.FLOAT,
            },
            stocks: {
                allowNull: false,
                type: Sequelize.INTEGER
            },
            required_time: {
                allowNull: false,
                type: Sequelize.INTEGER
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('Menus');

    }
};
