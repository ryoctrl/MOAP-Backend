'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        queryInterface.addColumn('TestUsers', 'address', {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: null
        });
    },

    down: async (queryInterface, Sequelize) => {
        queryInterface.removeColumn('TestUsers', 'address');
    }
};

