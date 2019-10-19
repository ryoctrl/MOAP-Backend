'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        queryInterface.addColumn('Orders', 'handed_at', {
            type: Sequelize.DATE,
            allowNull: true,
            defaultValue: null
        });
    },

    down: async (queryInterface, Sequelize) => {
        queryInterface.removeColumn('Orders', 'handed_at');
    }
};
