'use strict';
module.exports = (sequelize, DataTypes) => {
    const Order = sequelize.define('Order', {
        total_price: DataTypes.INTEGER,
        is_paid: DataTypes.BOOLEAN,
        is_completed: DataTypes.BOOLEAN,
        handed_at: DataTypes.DATE,
        buyer_address: DataTypes.STRING,
        user_id: DataTypes.INTEGER,
    }, {});
    Order.associate = function(models) {
        Order.hasMany(models.OrderItem, { foreignKey: 'order_id'});
    };
    return Order;
};
