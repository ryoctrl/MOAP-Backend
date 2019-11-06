'use strict';
module.exports = (sequelize, DataTypes) => {
  const TestUser = sequelize.define('TestUser', {
    number: DataTypes.STRING,
    hash: DataTypes.STRING,
    address: DataTypes.STRING,
  }, {});
  TestUser.associate = function(models) {
    // associations can be defined here
  };
  return TestUser;
};
