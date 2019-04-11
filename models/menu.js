'use strict';
module.exports = (sequelize, DataTypes) => {
  const Menu = sequelize.define('Menu', {
    name: DataTypes.STRING,
    price: DataTypes.FLOAT,
    stocks: DataTypes.INTEGER,
    required_time: DataTypes.INTEGER
  }, {});
  Menu.associate = function(models) {
    // associations can be defined here
  };
  return Menu;
};
