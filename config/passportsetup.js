// var express = require("express"),
//   passport = require("passport"),
//   OutlookStrategy = require("passport-outlook").Strategy,
//   User = require("../models/users");

// const OUTLOOK_CLIENT_ID = process.env.OUTLOOK_CLIENT_ID;
// const OUTLOOK_CLIENT_SECRET = process.env.OUTLOOK_CLIENT_SECRET;

// module.exports = (passport) => {
//   passport.use(
//     new OutlookStrategy(
//       {
//         clientID: OUTLOOK_CLIENT_ID,
//         clientSecret: OUTLOOK_CLIENT_SECRET,
//         callbackURL:
//           "http://localhost:3000/stud/gymkhana/sports/auth/outlook/callback",
//       },
//       function (accessToken, refreshToken, profile, done) {
//         var user = {
//           email: profile.emails[0].value,
//           name: profile.displayName,
//           outlookId: profile.id,
//         };

//         User.find({ isAdmin: true }, function (err, results) {
//           if (err) {
//             console.log(err);
//           }
//           if (!results.length) {
//             user.isAdmin = true;
//             console.log(user);
//           }
//         });

//         User.findOrCreate(user, function (err, user) {
//           return done(err, user);
//         });

//         // asynchronous verification, for effect...
//       }
//     )
//   );

//   passport.serializeUser(function (user, done) {
//     done(null, user);
//   });

//   passport.deserializeUser(function (obj, done) {
//     done(null, obj);
//   });
// };

const passport = require("passport");
const AzureStrategy = require("passport-azure-ad-oauth2").Strategy;

const User = require("../models/users");

const jwt = require("jsonwebtoken");
require("dotenv").config();
const { OUTLOOK_CLIENT_ID, OUTLOOK_CLIENT_SECRET, baseUrl } = process.env;

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => {
    done(null, user);
  });
});

passport.use(
  new AzureStrategy(
    {
      clientID: OUTLOOK_CLIENT_ID,
      clientSecret: OUTLOOK_CLIENT_SECRET,
      callbackURL: `${baseUrl}/auth/outlook/callback`,
    },
    async (accessToken, refresh_token, params, profile, done) => {
      try {
        var waadProfile = jwt.decode(params.id_token);
        const user = await User.findOne({ email: waadProfile.upn });
        if (user) return done(null, user);
        const newUser = new User({
          name: waadProfile.name,
          email: waadProfile.upn,
          accessToken: accessToken,
          isAdmin: false,
        });
        if (refresh_token) newUser.refreshToken = refresh_token;

        const users = await User.find({});
        if (users.length == 0) {
          newUser.isAdmin = true;
        }

        await newUser.save();
        return done(null, newUser);
      } catch (error) {
        console.log(error.message);
      }
    }
  )
);
