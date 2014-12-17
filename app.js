var express = require("express"),
  bodyParser = require("body-parser"),
  db = require("./models"),
  passport = require("passport"),
  session = require("cookie-session"),
  app = express();
  aws = require('aws-sdk'),
  

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));


/*
  What is the session?
  It is the object that lives in our app
    and records relevant info about users
    who are signed in
*/

app.use(session( {
  secret: 'thisismysecretkey',
  name: 'chocolate chip',
  // this is in milliseconds
  maxage: 3600000
  })
);

// get passport started
app.use(passport.initialize());
app.use(passport.session());

/*
SERIALizING
Turns relevant user data into a string to be 
  stored as a cookie
*/
passport.serializeUser(function(user, done){
  console.log("SERIALIZED JUST RAN!");

  done(null, user.id);
});


/*
DeSERIALizing
Taking a string and turns into an object
  using the relevant data stored in the session
*/
passport.deserializeUser(function(id, done){
  console.log("DESERIALIZED JUST RAN!");
  db.user.find({
      where: {
        id: id
      }
    })
    .then(function(secret){
      done(null, secret);
    },
    function(err) {
      done(err, null);
    });
});

// WHEN SOMEONE WANTS THE SIGNUP PAGE
app.get("/sign_up", function (req, res) {
  res.render("users/sign_up");
});

// WHEN SOMEONE  SUBMITS A SIGNUP PAGE
app.post("/users", function (req, res) {
  var newUser = req.body.user;
  console.log("New User:", newUser);
  // CREATE a user and secure their password
  db.user.createSecure(newUser.email, newUser.password, 
    function () {
      // if a user fails to create make them signup again
      res.redirect("/sign_up");
    },
    function (err, user) {
      // when successfully created log the user in
      // req.login is given by the passport
      req.login(user, function(){
        // after login redirect show page
        console.log("Id: ", user.id)
        res.redirect('/users/' + user.id);
      });
    })
});

//homepage search areacode for gardens
app.get('/', function (req,res) {
  res.render('site/index.ejs');
});

//about page
app.get('/about', function (req,res) {
  res.render('site/about.ejs');
});

//gardens in the area
app.get('/gardens', function (req,res){
  res.render('site/gardens.ejs');
});

//user garden
app.get('/garden', function (req,res){
  res.render('site/garden.ejs');
});

app.get('/gardenpictures',function (req,res){
  res.render('users/gardenUpload')
});

//this is where user uploads and adds areacode
app.get('/users/:id', function (req, res) {
 res.render('users/gardenUpload', {userId: req.params.id});
});

//save zipcode to database
app.post("/users/:id", function (req, res){
  var addZip = req.body.user.zipcode;
  console.log("ADDZIP", addZip)
   db.user.find(req.params.id).success(function(user){
    user.updateAttributes({zipcode: addZip}).then(function(user){
      console.log(user)
      res.redirect('/users/' + user.id);
    })
  });
});  

// When someone wants the login page
app.get("/login", function (req, res) {
  res.render("users/login");
});

// Temporary redirect to users profile
app.get('/temp', function (req, res) {
  res.redirect('/users/' + req.user.id);
});

// Authenticating a user
app.post('/login', passport.authenticate('local', {
  successRedirect: '/temp',
  failureRedirect: '/login'
}));


// app.post('users/:id', function (req, res) {
//   var userId = req.params.id;
//   var zipcode = req.body.user['zipcode'];
//   // add a zipcode to their row in the usertable
//   db.user
//     .find(userId)
//     .success( function (foundUser) {
//       user.save().success(function(){zipcode});
//       res.render('site/index'); 
//     })
//     .catch ( function (err) {
//       console.log(err);
//     });
// });


/// TESTING FILE UPLOAD
var multer = require('multer');
var done = false;

app.use(multer({ dest: __dirname + '/photos/',
    rename: function(fieldname, filename) {
      return filename + Date.now();
    },
    onFileUploadStart: function (file) {
      console.log(file.originalname + ' is starting');
    },
    onFileUploadComplete: function (file) {
      console.log(file.fieldname + ' uploaded to ' + file.path);
      done = true;
    }
}));

app.post('/fileupload', function(req, res){
  if (done === true) {
    console.log( req.files);
    res.send('file uploaded');
  }
});

 

 


app.listen(3000, function () {
  console.log("LISTENING");
})