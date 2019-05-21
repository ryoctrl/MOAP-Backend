'use strict';
module.exports = (sequelize, DataTypes) => {
  const OrderItem = sequelize.define('OrderItem', {
    order_id: DataTypes.INTEGER,
    menu_id: DataTypes.INTEGER,
    amount: DataTypes.INTEGER,
    price: DataTypes.INTEGER
  }, {});
  OrderItem.associate = function(models) {
      OrderItem.belongsTo(models.Menu);
      OrderItem.belongsTo(models.Order);
  };
  return OrderItem;
};
