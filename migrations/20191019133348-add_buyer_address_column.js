'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        queryInterface.addColumn('Orders', 'buyer_address', {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: null
        });
    },

    down: async (queryInterface, Sequelize) => {
        queryInterface.removeColumn('Orders', 'buyer_address');
    }
};
