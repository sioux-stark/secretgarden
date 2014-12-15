"use strict";

module.exports = function(sequelize, DataTypes) {
  var garden = sequelize.define("garden", {
    title: DataTypes.STRING,
    description: DataTypes.STRING,
    url: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        this.belongsTo(models.user);
      }
    }
  });

  return garden;
};
