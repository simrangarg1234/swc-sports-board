var express = require("express"),
  passport = require("passport"),
  userRouter = express.Router();
  Event = require('../models/events');
  require("dotenv").config();
const baseUrl = process.env.BaseUrl;


require("../config/passportsetup")(passport);

userRouter.get("/login", function (req, res) {
  res.redirect(baseUrl + "/auth/outlook");
});

userRouter.get(
  "/auth/outlook",
  passport.authenticate("windowslive", {
    scope: [
      "openid",
      "profile",
      "offline_access",
      "https://outlook.office.com/Mail.Read",
    ],
  })
);

userRouter.get(
  "/auth/outlook/callback",
  passport.authenticate("windowslive", { failureRedirect: "/login" }),
  function (req, res) {
    res.redirect(baseUrl + "/admin/club");
  }
);

userRouter.get("/logout", function (req, res) {
  req.logout();
  res.redirect(baseUrl);
});

userRouter.get("/", async(req, res)=> {
  id = req.params.id;
  const events = await Event.find({});
  // console.log(events);
  res.render("home", {events});
});

module.exports = userRouter;
