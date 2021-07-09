const User = require("../models/User.js");
const passport = require("passport");
const router = require("express").Router();

//redirected to /admin/success after Successful authentication
router.get("/success", function (req, res) {
  User.find({ useremail: { $ne: null } }, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        res.render("admin/club/index", { username: foundUser[0].username });
      }
    }
  });
});

router.get(
  "/login",
  passport.authenticate("windowslive", {
    scope: [
      "openid",
      "profile",
      "offline_access",
      "https://outlook.office.com/Mail.Read",
    ],
  })
);

//callback route for outlook to redirect to
router.get(
  "/login/redirect",
  passport.authenticate("windowslive", { failureRedirect: "/" }),
  function (req, res) {
    res.redirect("/admin/success");
  }
);

router.get("/logout", function (req, res) {
  res.clearCookie("connect.sid");
  res.redirect("/");
});

module.exports = router;
