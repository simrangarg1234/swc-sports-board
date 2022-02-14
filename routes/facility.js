const express = require("express");
var facilityRouter = express.Router();
const mongoose = require("mongoose");
const catchAsync = require("../utils/catchAsync");
const Facility = require("../models/facility");
const Gallery = require("../models/photogallery");
const { isLoggedIn,isAdmin } = require("../middlewares/index");
const { upload } = require("../middlewares/index");
require("dotenv").config();
const fs = require('fs');
const baseUrl = process.env.BaseUrl;

var uploadval = upload.fields([{ name: "images", maxCount: 5 }]);

facilityRouter.get("/", isLoggedIn,isAdmin,async (req, res) => {
  const facilities = await Facility.find({});
  const gal = await Gallery.find({} , { facilityGallery: 1});
  var gallery;
  if(gal.length != 0) {
    gallery = gal[0].facilityGallery;
  }
  res.render("admin/Facility/index", { facilities,gallery });
});

facilityRouter.get("/view/:id",isLoggedIn,isAdmin, (req, res) => {
  Facility.findOne({ _id: req.params.id }, (err, data) => {
    res.render("admin/Facility/view", { data });
  });
});

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

facilityRouter.post("/gallery", isLoggedIn, isAdmin, uploadval, async (req, res) => {

    if(req.files){
        const gallery = await Gallery.find({});
        if(gallery.length == 0) {
            var data = await new Gallery({});
            for(let i=0;i<req.files['images'].length;i++){
                data.facilityGallery.push(req.files['images'][i].path);
            }
            data.save().then((record)=>{
                res.redirect(baseUrl+'/admin/facility/');
            }).catch(err=>{
                console.log(err)
                res.redirect(baseUrl+'/admin/facility/');
            });
        } else {
            Gallery.find({}, (err, data) => {
                for(let i=0;i<req.files['images'].length;i++){
                    data[0].facilityGallery.push(req.files['images'][i].path);
                }
                data[0].save().then((record)=>{
                    res.redirect(baseUrl+'/admin/facility/');
                }).catch(err=>{
                    console.log(err)
                    res.redirect(baseUrl+'/admin/facility/');
                });
            })
        }
    } else {
        res.redirect(baseUrl+'/admin/facility/');
    }
});

facilityRouter.get("/gallery/:idx", isLoggedIn, isAdmin, async (req, res) => {
    Gallery.find({}, {facilityGallery: 1},(err,data)=>{
        if (data[0].facilityGallery!=null) {
            fs.unlink(`${data[0].facilityGallery[req.params.idx]}`, (err) => {
              if (err) {
                console.error(err);
              }});
        }
        data[0].facilityGallery.splice(req.params.idx,1);
        data[0].save().then(()=>{
            res.redirect(baseUrl+`/admin/facility`);
        })
    })
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
  "/:id",isLoggedIn,isAdmin,uploadval,
  catchAsync(async (req, res) => {
    const data = req.body;   
    const facility = await Facility.findById(req.params.id);

    if (!facility){
      return res.status(404).send("facility with the given id not found");
    }
    
    facility.name = data.name;
    facility.info = data.info;
    if(req.files['images']){
        if (facility.image!=null && facility.image.indexOf("https://") == -1) {
            console.log(`${facility.image}`);
            fs.unlink(`${facility.image}`, (err) => {
              if (err) {
                console.error(err);
              }});
        }
        facility.image = req.files["images"][0].path;
    }
    await facility.save();

    req.flash("success", "Info details updated!");
    res.redirect(baseUrl+`/admin/facility`);
  })
);

facilityRouter.delete(
  "/:id",isLoggedIn,isAdmin,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const facility = await Facility.findById(id);

    if (facility.image!=null && facility.image.indexOf("https://") == -1) {
        console.log(`${facility.image}`);
        fs.unlink(`${facility.image}`, (err) => {
          if (err) {
            console.error(err);
          }});
    }
    await Facility.findByIdAndDelete(id);
    req.flash("success", "Member no longer exists!");
    res.redirect(baseUrl+"/admin/facility");
  })
);

module.exports = facilityRouter;
