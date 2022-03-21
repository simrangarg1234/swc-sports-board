const express = require('express');
var eventsRouter = express.Router();
const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');
const Event = require('../models/events');
const Gallery = require('../models/photogallery');
const { isLoggedIn,isAdmin } = require("../middlewares/index");
const {upload}= require('../middlewares/index');
require("dotenv").config();
const fs = require('fs');
const baseUrl = process.env.BaseUrl;

var uploadval= upload.fields([{name:'images',maxCount:10},{name:'pdf',maxCount:1}]);

eventsRouter.get("/add",isLoggedIn,isAdmin, (req,res)=>{
    res.render('admin/event/add');
});

eventsRouter.post("/add",isLoggedIn,isAdmin, uploadval, async (req, res) => {
    const data = req.body;
   
    const event = await new Event({
      name: data.name,
      desc: data.desc,
      date: data.date,
    });
    
    if(req.files['images']){
        event.image = req.files["images"][0].path;
    }

    if(req.files['pdf']){
        event.score = req.files['pdf'][0].path;
    }
    
    console.log(data);
  
    await event.save();
    req.flash("success", "New Info added successfully!");
    res.redirect(baseUrl+"/admin/events");
  });


eventsRouter.get("/view/:id", isLoggedIn,isAdmin,(req, res) => {
    Event.findOne({ _id: req.params.id }, (err, data) => {
      res.render("admin/event/view", { data });
    });
});


eventsRouter.get(
    "/:id/edit", isLoggedIn,isAdmin,
    async (req, res) => {
      const event = await Event.findById(req.params.id);
      if (!event) {
        req.flash("error", "Cannot find this Event!");
        return res.redirect(baseUrl+"/admin/events");
      }
      res.render("admin/event/edit", { event });
});

eventsRouter.post("/gallery", isLoggedIn, isAdmin, uploadval, async (req, res) => {

    if(req.files){
        const gallery = await Gallery.find({});
        if(gallery.length == 0) {
            var data = await new Gallery({});
            for(let i=0;i<req.files['images'].length;i++){
                data.homeGallery.push(req.files['images'][i].path);
            }
            data.save().then((record)=>{
                console.log("record",record);
                res.redirect(baseUrl+'/admin/events/');
            }).catch(err=>{
                console.log(err)
                res.redirect(baseUrl+'/admin/events/');
            });
        } else {
            Gallery.find({}, (err, data) => {
                for(let i=0;i<req.files['images'].length;i++){
                    data[0].homeGallery.push(req.files['images'][i].path);
                }
                data[0].save().then((record)=>{
                    console.log("record",record);
                    res.redirect(baseUrl+'/admin/events/');
                }).catch(err=>{
                    console.log(err)
                    res.redirect(baseUrl+'/admin/events/');
                });
            })
        }
    } else {
        res.redirect(baseUrl+'/admin/events/');
    }
});

eventsRouter.get("/gallery/:idx", isLoggedIn, isAdmin, async (req, res) => {
    Gallery.find({}, {homeGallery: 1},(err,data)=>{
        if (data[0].homeGallery!=null) {
            fs.unlink(`${data[0].homeGallery[req.params.idx]}`, (err) => {
              if (err) {
                console.error(err);
              }});
        }
        data[0].homeGallery.splice(req.params.idx,1);
        data[0].save().then(()=>{
            res.redirect(baseUrl+`/admin/events`);
        })
    })
});

eventsRouter.post("/:id",isLoggedIn,isAdmin, uploadval, async (req, res) => {
    const data = req.body;   
    const event = await Event.findById(req.params.id);

    if (!event){
      return res.status(404).send("event with the given id not found");
    }
    
    event.name = data.name;
    event.desc = data.desc;
    event.date = data.date;

    if(req.files['images']){
        if (event.image!=null && event.image.indexOf("https://") == -1) {
            console.log(`${event.image}`);
            fs.unlink(`${event.image}`, (err) => {
              if (err) {
                console.error(err);
              }});
        }
        event.image = req.files["images"][0].path;
    }

    if(req.files['pdf']){
        if (event.score!=null && event.score.indexOf("https://") == -1) {
            console.log(`${event.score}`);
            fs.unlink(`${event.score}`, (err) => {
              if (err) {
                console.error(err);
              }});
        }
        event.score = req.files['pdf'][0].path;
    }
   
    
  
    await event.save();

    req.flash("success", "Info details updated!");
    res.redirect(baseUrl+`/admin/events`);
});


eventsRouter.get('/:id/delimg/',isLoggedIn,isAdmin,(req,res)=>{
    Event.findOne({_id:req.params.id}).then(data=>{
        if (data.image!=null && data.image.indexOf("https://") == -1) {
            console.log(`${data.image}`);
            fs.unlink(`${data.image}`, (err) => {
              if (err) {
                console.error(err);
              }});
        }
        data.image = null;
        data.save().then(()=>{
            res.redirect(baseUrl+`/admin/events/${req.params.id}/edit/`);
        })
    })
  })
  

eventsRouter.delete(
    "/:id",isLoggedIn,isAdmin,
    async (req, res) => {
      const { id } = req.params;
      const event = await Event.findById(id);

        if (event.image!=null && event.image.indexOf("https://") == -1) {
            console.log(`${event.image}`);
            fs.unlink(`${event.image}`, (err) => {
              if (err) {
                console.error(err);
              }});
        }
        if (event.score!=null && event.score.indexOf("https://") == -1) {
            console.log(`${event.score}`);
            fs.unlink(`${event.score}`, (err) => {
              if (err) {
                console.error(err);
              }});
        }
      await Event.findByIdAndDelete(id);
      req.flash("success", "Member no longer exists!");
      res.redirect(baseUrl+"/admin/events");
});

eventsRouter.get("/", isLoggedIn,isAdmin,async(req,res)=>{
    const events = await Event.find({});
    const gal = await Gallery.find({} , { homeGallery: 1});
    var gallery;
    if(gal.length != 0) {
        gallery = gal[0].homeGallery;
    }
    res.render('admin/event/index', {events,gallery});
});




module.exports = eventsRouter;