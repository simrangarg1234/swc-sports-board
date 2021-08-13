var express = require("express"),
  passport = require("passport"),
  userRouter = express.Router();
require("../config/passportsetup")(passport);

userRouter.get("/login", function (req, res) {
  res.render("login");
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
    res.redirect("/admin");
  }
);

userRouter.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

userRouter.get("/", function (req, res) {
  res.render("home");
});

module.exports = userRouter;
