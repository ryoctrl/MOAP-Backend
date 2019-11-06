'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        queryInterface.addColumn('Orders', 'user_id', {
            type: Sequelize.INTEGER,
            references: {
                model: 'TestUsers',
                key: 'id',
            }
        });
    },

    down: async (queryInterface, Sequelize) => {
        queryInterface.removeColumn('Orders', 'user_id');
    }
};

