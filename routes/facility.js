const express = require("express");
var facilityRouter = express.Router();
const mongoose = require("mongoose");
const catchAsync = require("../utils/catchAsync");
const Facility = require("../models/facility");
const { isLoggedIn,isAdmin } = require("../middlewares/index");
const { upload } = require("../middlewares/index");
require("dotenv").config();
const baseUrl = process.env.BaseUrl;

facilityRouter.get("/", isLoggedIn,isAdmin,async (req, res) => {
  const facilities = await Facility.find({});
  res.render("admin/Facility/index", { facilities });
});

facilityRouter.get("/view/:id",isLoggedIn,isAdmin, (req, res) => {
  Facility.findOne({ _id: req.params.id }, (err, data) => {
    res.render("admin/Facility/view", { data });
  });
});

var uploadval = upload.fields([{ name: "images", maxCount: 5 }]);

facilityRouter.post("/add", isLoggedIn,isAdmin,uploadval, async (req, res) => {
  const data = req.body;
  console.log(data);
  const facility = await new Facility({
    name: data.name,
    info: data.info,
  });

  for (let i = 0; i < req.files["images"].length; i++) {
    facility.image.push(req.files["images"][i].path);
  }

  await facility.save();
  req.flash("success", "New Info added successfully!");
  res.redirect(baseUrl+"/admin/facility");
});

facilityRouter.get("/add", isLoggedIn,isAdmin,(req, res) => {
  res.render("admin/Facility/add");
});

facilityRouter.get(
  "/:id/edit",isLoggedIn,isAdmin,
  catchAsync(async (req, res) => {
    const facility = await Facility.findById(req.params.id);
    if (!facility) {
      req.flash("error", "Cannot find this facility!");
      return res.redirect(baseUrl+"/admin/facility");
    }
    res.render("admin/Facility/edit", { facility });
  })
);

facilityRouter.put(
  "/:id",isLoggedIn,isAdmin,
  catchAsync(async (req, res) => {
    const id = req.params.id;
    const data = req.body;
    let facility = await Facility.findByIdAndUpdate(
      id,
      {
        name: data.name,
        image: data.image,
        info: data.info,
      },
      { new: true }
    );
    if (!facility)
      return res.status(404).send("Info with the given id not found");
    req.flash("success", "Info details updated!");
    res.redirect(baseUrl+`/admin/facility`);
  })
);

facilityRouter.delete(
  "/:id",isLoggedIn,isAdmin,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Facility.findByIdAndDelete(id);
    req.flash("success", "Member no longer exists!");
    res.redirect(baseUrl+"/admin/facility");
  })
);

module.exports = facilityRouter;
