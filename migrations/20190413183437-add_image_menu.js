'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        queryInterface.addColumn('Menus', 'image', {
            type: Sequelize.STRING,
        })
    },
    down: async (queryInterface, Sequelize) => {
        queryInterface.removeColumn('Menus', 'image');
    }
};
