'use strict';
module.exports = (sequelize, DataTypes) => {
    const Order = sequelize.define('Order', {
        total_price: DataTypes.INTEGER,
        is_paid: DataTypes.BOOLEAN
    }, {});
    Order.associate = function(models) {
        Order.hasMany(models.OrderItem);
    };
    return Order;
};
