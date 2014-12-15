"use strict";

module.exports = function(sequelize, DataTypes) {
  var user = sequelize.define("user", {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    lattitude: DataTypes.STRING,
    longitude: DataTypes.STRING
  }, {
    classMethods: {
       associate: function(models) {
        this.hasMany(models.garden);
      }
    }
  });

  return user;
};
