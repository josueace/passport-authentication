const express = require('express');
const router = express.Router();
// Require user model
const passport = require("passport");
const ensureLogin = require("connect-ensure-login");

const User = require("../models/User.model.js");
const Room = require("../models/room.js");

// Add bcrypt to encrypt passwords
const bcrypt = require("bcrypt");
const bcryptSalt = 10;

// Add passport


router.get('/private-page', ensureLogin.ensureLoggedIn(), (req, res) => {
  res.render('auth/private', { user: req.user });
});

router.get("/signup", (req, res, next) => {
  res.render("auth/signup");
});

router.post("/signup", (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username === "" || password === "") {
    res.render("auth/signup", { message: "Indicate username and password" });
    return;
  }

  User.findOne({ username })
  .then(user => {
    if (user !== null) {
      res.render("auth/signup", { message: "The username already exists" });
      return;
    }

    const salt = bcrypt.genSaltSync(bcryptSalt);
    const hashPass = bcrypt.hashSync(password, salt);

    const newUser = new User({
      username,
      password: hashPass
    });

    newUser.save((err) => {
      if (err) {
        res.render("auth/signup", { message: "Something went wrong" });
      } else {
        res.redirect("/");
      }
    });
  })
  .catch(error => {
    next(error)
  })
});

router.post("/login", passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login",
  failureFlash: true,
  passReqToCallback: true
}));

router.get("/login", (req, res, next) => {
  res.render("auth/login", { "message": req.flash("error") });

});

router.get('/private', ensureAuthenticated, (req, res) => {
  res.render('private', {user: req.user});
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/login')
  }
}

router.post('/rooms', ensureAuthenticated, (req, res, next) => {
  const newRoom = new Room ({
    name:  req.body.name,
    url:  req.body.room,
    owner: req.user._id   // <-- we add the user ID
  });

  newRoom.save ((err) => {
    if (err) { return next(err); }
    else {
      res.redirect('/rooms');
    }
  })
});

router.get('/rooms', ensureAuthenticated, (req, res, next) => {

  Room.find({owner: req.user._id}, (err, myRooms) => {
    if (err) { return next(err); }

    res.render('rooms', { rooms: myRooms });
  });

});

router.get('/reservation', ensureAuthenticated, (req, res) => {
  res.render('reservation', {user: req.user._id});
});

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/login");
});

module.exports = router;
