const express = require('express');
var eventsRouter = express.Router();
const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');
const Event = require('../models/events');
const { isAdmin } = require("../middlewares/index");
const {upload}= require('../middlewares/index');

var uploadval= upload.fields([{name:'images',maxCount:10},{name:'pdf',maxCount:1}]);


eventsRouter.get("/add", (req,res)=>{
    res.render('admin/event/add');
});

eventsRouter.post("/add", uploadval, async (req, res) => {
    const data = req.body;
   
    const event = await new Event({
      name: data.name,
      desc: data.desc,
      start: data.start,
      end: data.end,
      score:req.files['pdf'][0].path,
    });
    
     
    event.image = req.files["images"][0].path;
    
  
    await event.save();
    req.flash("success", "New Info added successfully!");
    res.redirect("/stud/gymkhana/sports/admin/events");
  });


eventsRouter.get("/view/:id", (req, res) => {
    Event.findOne({ _id: req.params.id }, (err, data) => {
      res.render("admin/event/view", { data });
    });
});


eventsRouter.get(
    "/:id/edit", 
    async (req, res) => {
      const event = await Event.findById(req.params.id);
      if (!event) {
        req.flash("error", "Cannot find this Event!");
        return res.redirect("/stud/gymkhana/sports/admin/events");
      }
      res.render("admin/event/edit", { event });
});

eventsRouter.post("/:id", uploadval, async (req, res) => {
   

    const data = req.body;   
    const event = await Event.findById(req.params.id);

    if (!event){
      return res.status(404).send("event with the given id not found");
    }
    
    event.name = data.name;
    event.desc = data.desc;
    event.start = data.start;
    event.end = data.end;
    if(req.files['images']){
        event.image = req.files["images"][0].path;
    }

    if(req.files['pdf']){
        event.score = req.files['pdf'][0].path;
    }
   
    
  
    await event.save();

    req.flash("success", "Info details updated!");
    res.redirect(`/stud/gymkhana/sports/admin/events`);
});


eventsRouter.get('/:id/delimg/',(req,res)=>{
    Event.findOne({_id:req.params.id}).then(data=>{
        data.image = null;
        data.save().then(()=>{
            res.redirect(`/stud/gymkhana/sports/admin/events/${req.params.id}/edit/`);
        })
    })
  })
  

eventsRouter.delete(
    "/:id",
    async (req, res) => {
      const { id } = req.params;
      await Event.findByIdAndDelete(id);
      req.flash("success", "Member no longer exists!");
      res.redirect("/stud/gymkhana/sports/admin/events");
});
eventsRouter.get("/", async(req,res)=>{
    const events = await Event.find({});
    res.render('admin/event/index', {events});
});


module.exports = eventsRouter;