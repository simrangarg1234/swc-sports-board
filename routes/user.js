var express = require("express"),
  passport = require("passport"),
  userRouter = express.Router();

const Club = require("../models/club"),
  Spardha = require("../models/spardha"),
  Alumni = require("../models/alumni"),
  User = require("../models/users"),
  Team = require("../models/team"),
  Event = require("../models/events"),
  facilities = require("../models/facility");
Gallery = require("../models/photogallery");

const baseUrl = process.env.BaseUrl;

require("dotenv").config();
require("../config/passportsetup")(passport);

// auth routes
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

userRouter.get("/", async (req, res) => {
  id = req.params.id;
  const events = await Event.find({});
  const gal = await Gallery.find({}, { homeGallery: 1 });
  var gallery;
  if (gal.length != 0) {
    gallery = gal[0].homeGallery;
  }
  res.render("home", { events, gallery });
});

//Home page for clubs
userRouter.get("/clubs", async (req, res) => {
  const data = await Club.find({});
  const gal = await Gallery.find({}, { clubGallery: 1 });
  var gallery;
  if (gal.length != 0) {
    gallery = gal[0].clubGallery;
  }
  res.render("clubs/club", { data, gallery });
});

//Mini page of each club
userRouter.get("/clubs/:clubid/home", (req, res) => {
  Club.findOne({ _id: req.params.clubid }, (err, data) => {
    // console.log("Club data", data);
    const gallery = data.gallery;
    res.render("clubs/home", { club: data, gallery });
  });
});

//Spardha
userRouter.get("/spardha", async (req, res) => {
  const data = await Spardha.find({});
  const gal = await Gallery.find({}, { spardhaGallery: 1 });
  var gallery;
  if (gal.length != 0) {
    gallery = gal[0].spardhaGallery;
  }
  res.render("spardha/view", { data, gallery });
});

userRouter.get("/spardha/:year", (req, res) => {
  Spardha.findOne({ Year: req.params.year }, (err, datas) => {
    res.render("spardha/past", { data: datas });
  });
});

userRouter.get("/spardha/past/:yr", (req, res) => {
  Spardha.find({}, (err, data) => {
    res.render(`spardha/spardha${req.params.yr}`, { data });
  });
});

userRouter.all("/spardha", (req, res) => {
  Spardha.find({}, (err, data) => {
    res.render("spardha/spardhaNav", { data });
  });
});

//Alumni
userRouter.get("/alumni", async (req, res) => {
  const data = await Alumni.find({});
  const gal = await Gallery.find({}, { alumniGallery: 1 });
  var gallery;
  if (gal.length != 0) {
    gallery = gal[0].alumniGallery;
  }
  res.render("alumni/view", { data, gallery });
});

//Team
userRouter.get("/teams", async (req, res) => {
  const gal = await Gallery.find({}, { teamGallery: 1 });
  var gallery;
  if (gal.length != 0) {
    gallery = gal[0].teamGallery;
  }
  Team.find({})
    .sort({ priority: 1 })
    .then((teams) => {
      res.render("teams/view", { teams, gallery });
    });
});

//Facility
userRouter.get("/facilities", async (req, res) => {
  const data = await facilities.find({});
  const gal = await Gallery.find({}, { facilityGallery: 1 });
  var gallery;
  if (gal.length != 0) {
    gallery = gal[0].facilityGallery;
  }
  res.render("facilities/view", { data, gallery });
});

// only route to read pdf
userRouter.get("/pdf/uploads/:id", (req, res) => {
  const id = req.params.id;
  const filePath = "/stud/gymkhana/sports/uploads/" + id;
  // console.log(filePath);
  fs.readFile(filePath, (err, data) => {
    res.contentType("application/pdf");
    return res.send(data);
  });
});

module.exports = userRouter;
