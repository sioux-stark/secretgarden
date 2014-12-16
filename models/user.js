// "use strict";

// module.exports = function(sequelize, DataTypes) {
//   var user = sequelize.define("user", {
//     name: DataTypes.STRING,
//     email: DataTypes.STRING,
//     password: DataTypes.STRING,
//     lattitude: DataTypes.STRING,
//     longitude: DataTypes.STRING
//   }, {
//     classMethods: {
//        associate: function(models) {
//         this.hasMany(models.garden);
//       }
//     }
//   });

//   return user;
// };

"use strict";

var bcrypt        = require('bcrypt'),
    passport      = require('passport'),
    passportLocal = require('passport-local');

module.exports = function(sequelize, DataTypes) {
  var user = sequelize.define("user", {
                                       email           : DataTypes.STRING,
                                       password: DataTypes.STRING
                                       
  }, {
    instanceMethods: {
      checkPassword: function (password) {
        return bcrypt.compareSync (password, this.password);
      }
    }, 
    classMethods: {
      associate: function (models) {
        // associations can be defined here
        //this.hasMany (models.article);
      },
      findByEmail: function (email) {
        return this.find({
                          where: {
                                  email : email
                          }
        });
      },
      encryptPassword: function (password) {
          var salt = bcrypt.genSaltSync (13);
          var hash = bcrypt.hashSync (password, salt);
       return hash;
      },
      createSecure: function (email, password, error, success) {
        var hash = this.encryptPassword (password);
        this.create({
                     email           : email,
                     password: hash
            })
            .then(
              function (user) {
                console.log ("User has logged in")
                success     (null, user, { message : "Logged In!" });
              },
              function (err) {
                console.log ("User wasn't able to log in...")
                console.log ( arguments + "\n" )
                console.log ( err + "\n" )
                error (null, false, { message : "Something went wrong..." });
              }
            );
      },
      authenticate: function (email, password, done) { 
        this.findByEmail (email)
            .then( function (user) {
                   if (user.checkPassword (password) ){
                          done (null, user);
                   } else {
                          done (null, false, { message : "Unable to Authenticate" });
                          }
            },
            function (err) {
                done (err)
            })  
      }
    }//ends class methods
  });//closes User definition in sequelize, 
    //below are authentication settings used in the model's methods

  passport.use (
    new passportLocal.Strategy ({
                                 usernameField     : 'user[email]',
                                 passwordField     : 'user[password]',
                                 passReqToCallback : true
                                },
                                function (req, email, password, done){
                                  console.log ("Authenticating");
                                  user.authenticate (email, password, done);
                                }
    )
  )

  return user;
};

