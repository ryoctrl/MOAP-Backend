'use strict';
module.exports = (sequelize, DataTypes) => {
  const Menu = sequelize.define('Menu', {
    name: DataTypes.STRING,
    price: DataTypes.FLOAT,
    stocks: DataTypes.INTEGER,
    required_time: DataTypes.INTEGER,
    image: DataTypes.STRING,
  }, {});
  Menu.associate = function(models) {
      Menu.hasOne(models.OrderItem, {foreignKey: 'menu_id'})
  };
  return Menu;
};
