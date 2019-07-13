'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        queryInterface.addColumn('Orders', 'is_completed', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
        });
    },
    down: async (queryInterface, Sequelize) => {
        queryInterface.removeColumn('Orders', 'is_completed');
    }
};
