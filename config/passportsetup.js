var express = require("express"),
  passport = require("passport"),
  OutlookStrategy = require("passport-outlook").Strategy,
  User = require("../models/users");

const OUTLOOK_CLIENT_ID = "69cc8899-16f8-415c-91da-1ddc110a322a";
const OUTLOOK_CLIENT_SECRET = "Yq96XFCGLa0KPVhGM5DkU554C1-K~_c15_";

module.exports = (passport) => {
  passport.use(
    new OutlookStrategy(
      {
        clientID: OUTLOOK_CLIENT_ID,
        clientSecret: OUTLOOK_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/outlook/callback",
      },
      function (accessToken, refreshToken, profile, done) {
        var user = {
          email: profile.emails[0].value,
          name: profile.displayName,
          outlookId: profile.id,
        };

        User.find({}, function (err, results) {
          if (err) {
            console.log(err);
          }
          if (!results.length) {
            user.isAdmin = true;
            console.log(user);
          }
        });

        User.findOrCreate(user, function (err, user) {
          return done(err, user);
        });

        // asynchronous verification, for effect...
      }
    )
  );

  passport.serializeUser(function (user, done) {
    done(null, user);
  });

  passport.deserializeUser(function (obj, done) {
    done(null, obj);
  });
};
