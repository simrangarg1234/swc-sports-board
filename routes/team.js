const express = require('express');
var router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Team = require('../models/team');
const Gallery = require('../models/photogallery');
const { isLoggedIn,isAdmin } = require("../middlewares/index");
const { upload } = require("../middlewares/index");
var uploadval = upload.fields([{ name: "images", maxCount: 5 }]);
require("dotenv").config();
const fs= require('fs');
const baseUrl = process.env.BaseUrl;

var uploadval= upload.fields([{name:'images',maxCount:10}]);

router.get('/',isLoggedIn,isAdmin, async (req, res) => {
    const teams = await Team.find({}).sort({priority: 1});
    const gal = await Gallery.find({} , { teamGallery: 1});
    var gallery;
    if(gal.length != 0) {
        gallery = gal[0].teamGallery;
    }
    res.render('admin/team/index', {teams,gallery});
});

router.post('/',isLoggedIn,isAdmin, uploadval, async (req, res) => {
    const data = req.body; 
    const team = await new Team({
        priority: data.priority,
        name: data.name,
        position: data.position,
        hostel: data.hostel,
        contact1: data.contact1,
        contact2: data.contact2,
        email: data.email
    });
    team.image = req.files["images"][0].path;
    await team.save();
    //req.flash('success', 'New member added successfully!');
    res.redirect(baseUrl+'/admin/team');
});

router.get('/add', isLoggedIn,isAdmin, (req, res) => {
    res.render('admin/team/add');
});

router.get('/:id', isLoggedIn,isAdmin, catchAsync(async (req, res,) => {
    const team = await Team.findById(req.params.id);
    if (!team) {
        req.flash('error', 'Cannot find this member!');
        return res.redirect(baseUrl+'/admin/team');
    }
    res.render('admin/team/show', { team });
}));

router.get('/:id/edit', isLoggedIn,isAdmin,catchAsync(async (req, res) => {
    const team = await Team.findById(req.params.id)
    if (!team) {
        req.flash('error', 'Cannot find this member!');
        return res.redirect(baseUrl+'/admin/team');
    }
    res.render('admin/team/edit', { team });
}));
    
router.put('/:id',isLoggedIn,isAdmin, uploadval, catchAsync(async (req, res) => {
    const data = req.body;   
    const team = await Team.findById(req.params.id);

    if (!team){
      return res.status(404).send("team with the given id not found");
    }
    
    team.priority= data.priority;
    team.name= data.name;
    team.position= data.position;
    team.hostel= data.hostel;
    team.contact1= data.contact1;
    team.email= data.email;
    if(req.files['images']){
        if (team.image!=null && team.image.indexOf("https://") == -1) {
            console.log(`${team.image}`);
            fs.unlink(`${team.image}`, (err) => {
              if (err) {
                console.error(err);
              }});
        }
        team.image = req.files["images"][0].path;
    }
    await team.save();

    req.flash('success', 'Member details updated!');
    res.redirect(baseUrl+`/admin/team`);
}));
    
router.get('/:id/delimg/',isLoggedIn,isAdmin,(req,res)=>{
    Team.findOne({_id:req.params.id}).then(data=>{
        if (data.image!=null && data.image.indexOf("https://") == -1) {
            console.log(`${data.image}`);
            fs.unlink(`${data.image}`, (err) => {
              if (err) {
                console.error(err);
              }});
        }
        data.image = null;
        data.save().then(()=>{
            res.redirect(baseUrl+`/admin/team/${req.params.id}/edit`);
        })
    })
});

router.delete('/:id', isLoggedIn,isAdmin, catchAsync(async (req, res) => {
    const { id } = req.params;
    const team = await Team.findById(id);

    if (team.image!=null && team.image.indexOf("https://") == -1) {
        console.log(`${team.image}`);
        fs.unlink(`${team.image}`, (err) => {
          if (err) {
            console.error(err);
          }});
    }
    await Team.findByIdAndDelete(id);
    req.flash('success', 'Member no longer exists!')
    res.redirect(baseUrl+'/admin/team');
}));

router.post("/gallery", isLoggedIn, isAdmin, uploadval, async (req, res) => {

    if(req.files){
        const gallery = await Gallery.find({});
        if(gallery.length == 0) {
            var data = await new Gallery({});
            for(let i=0;i<req.files['images'].length;i++){
                data.teamGallery.push(req.files['images'][i].path);
            }
            data.save().then((record)=>{
                console.log("record",record);
                res.redirect(baseUrl+'/admin/team/');
            }).catch(err=>{
                console.log(err)
                res.redirect(baseUrl+'/admin/team/');
            });
        } else {
            Gallery.find({}, (err, data) => {
                for(let i=0;i<req.files['images'].length;i++){
                    data[0].teamGallery.push(req.files['images'][i].path);
                }
                data[0].save().then((record)=>{
                    console.log("record",record);
                    res.redirect(baseUrl+'/admin/team/');
                }).catch(err=>{
                    console.log(err)
                    res.redirect(baseUrl+'/admin/team/');
                });
            })
        }
    } else {
        res.redirect(baseUrl+'/admin/team/');
    }
});

router.get("/gallery/:idx", isLoggedIn, isAdmin, async (req, res) => {
    Gallery.find({}, {teamGallery: 1},(err,data)=>{
        if (data[0].teamGallery!=null) {
            fs.unlink(`${data[0].teamGallery[req.params.idx]}`, (err) => {
              if (err) {
                console.error(err);
              }});
        }
        data[0].teamGallery.splice(req.params.idx,1);
        data[0].save().then(()=>{
            res.redirect(baseUrl+`/admin/team`);
        })
    })
});

module.exports = router;