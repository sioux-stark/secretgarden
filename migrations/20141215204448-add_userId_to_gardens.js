"use strict";

module.exports = {
  up: function(migration, DataTypes, done) {
    // add altering commands here, calling 'done' when finished
    migration.addColumn("gardens", "userId", {
      type: DataTypes.INTEGER
    }).done(done)
    },
  down: function(migration, DataTypes, done) {
    // add reverting commands here, calling 'done' when finished
    migration.removeColumn("garden", "userId").done(done);
 }
};  