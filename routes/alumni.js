const express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');
const Alumni = require('../models/alumni');
const Gallery = require('../models/photogallery');
const { isLoggedIn,isAdmin } = require("../middlewares/index");
const { upload } = require("../middlewares/index");
var uploadval = upload.fields([{ name: "images", maxCount: 5 }]);
require("dotenv").config();
const fs = require('fs');
const baseUrl = process.env.BaseUrl;

router.get('/', isLoggedIn,isAdmin, async (req, res) => {
    const alumnis = await Alumni.find({});
    const gal = await Gallery.find({} , { alumniGallery: 1});
    var gallery;
    if(gal.length != 0) {
        gallery = gal[0].alumniGallery;
    }
    res.render('admin/alumni/index', {alumnis, gallery});
});

router.post('/',isLoggedIn,isAdmin, uploadval, async (req, res) => {
    const data = req.body;
    const alumni = await new Alumni({
        name: data.name,
        email: data.email,
        contact: data.contact,
        experience: data.experience,
    })
    alumni.image = req.files["images"][0].path;

    await alumni.save();
    //req.flash('success', 'New member added successfully!');
    res.redirect(baseUrl+'/admin/alumni');
});

router.get('/add',isLoggedIn,isAdmin, (req, res) => {
    res.render('admin/alumni/add');
});

router.get('/:id',isLoggedIn,isAdmin ,catchAsync(async (req, res,) => {
    Alumni.findOne({_id:req.params.id},(err,data)=>{
        res.render('admin/alumni/show',{data})
    })
    //res.render('admin/alumni/show', { alumni });
}));

router.get('/:id/edit',isLoggedIn,isAdmin ,catchAsync(async (req, res) => {
    const alumni = await Alumni.findById(req.params.id)
    if (!alumni) {
        req.flash('error', 'Cannot find this member!');
        return res.redirect(baseUrl+'/admin/alumni');
    }
    res.render('admin/alumni/edit', { alumni });
}));
    
router.put('/:id',isLoggedIn,isAdmin, uploadval, catchAsync(async (req, res) => {

    const id = req.params.id;
    const data = req.body;
    const alumni = await Alumni.findById(req.params.id);

    if (!alumni){
      return res.status(404).send("Alumni with the given id not found");
    }
    
    alumni.name = data.name;
    alumni.email = data.email;
    alumni.contact = data.contact;
    alumni.experience = data.experience;
    if(req.files['images']){
        if (alumni.image!=null && alumni.image.indexOf("https://") == -1) {
            console.log(`${alumni.image}`);
            fs.unlink(`${alumni.image}`, (err) => {
              if (err) {
                console.error(err);
              }});
        }
        alumni.image = req.files["images"][0].path;
    }

    await alumni.save();

    req.flash('success', 'Member details updated!');
    res.redirect(baseUrl + '/admin/alumni');
}));
    
router.delete('/:id',isLoggedIn,isAdmin, catchAsync(async (req, res) => {
    const { id } = req.params;
    const data = await Alumni.findById(id);
    if (data.image.indexOf("https://") == -1) {
        console.log(`${data.image}`);
        fs.unlink(`${data.image}`, (err) => {
          if (err) {
            console.error(err);
            return res.redirect(baseUrl+"/admin/events");
          }});
    }
    await Alumni.findByIdAndDelete(id);
    req.flash('success', 'Member no longer exists!')
    res.redirect(baseUrl+'/admin/alumni');
}));

router.get('/:id/delimg/',isLoggedIn,isAdmin,(req,res)=>{
    Alumni.findOne({_id:req.params.id}).then(data=>{
        if (data.image.indexOf("https://") == -1) {
            console.log(`${data.image}`);
            fs.unlink(`${data.image}`, (err) => {
              if (err) {
                console.error(err);
                return res.redirect(baseUrl+"/admin/events");
              }});
        }
        data.image = null;
        data.save().then(()=>{
            res.redirect(baseUrl+`/admin/alumni/${req.params.id}/edit`);
        })
    })
});

router.post("/gallery", isLoggedIn, isAdmin, uploadval, async (req, res) => {

    if(req.files){
        const gallery = await Gallery.find({});
        if(gallery.length == 0) {
            var data = await new Gallery({});
            for(let i=0;i<req.files['images'].length;i++){
                data.alumniGallery.push(req.files['images'][i].path);
            }
            data.save().then((record)=>{
                // console.log("record",record);
                res.redirect(baseUrl+'/admin/alumni/');
            }).catch(err=>{
                console.log(err)
                res.redirect(baseUrl+'/admin/alumni/');
            });
        } else {
            Gallery.find({}, (err, data) => {
                for(let i=0;i<req.files['images'].length;i++){
                    data[0].alumniGallery.push(req.files["images"][i].path);
                }
                data[0].save().then((record)=>{
                    console.log("record",record);
                    res.redirect(baseUrl+'/admin/alumni/');
                }).catch(err=>{
                    console.log(err)
                    res.redirect(baseUrl+'/admin/alumni/');
                });
            })
        }
    } else {
        res.redirect(baseUrl+'/admin/alumni/');
    }
});

router.get("/gallery/:idx", isLoggedIn, isAdmin, async (req, res) => {
    Gallery.find({}, {alumniGallery: 1},(err,data)=>{
        if (data[0].alumniGallery!=null) {
            fs.unlink(`${data[0].alumniGallery[req.params.idx]}`, (err) => {
              if (err) {
                console.error(err);
              }});
        }
        data[0].alumniGallery.splice(req.params.idx,1);
        data[0].save().then(()=>{
            res.redirect(baseUrl+`/admin/alumni`);
        })
    })
});

//View:Add Achievements->GET Request
router.get('/:id/add/achievement',isLoggedIn,isAdmin,(req,res)=>{
    Alumni.findOne({_id:req.params.id},(err,data)=>{
        res.render('admin/alumni/add_achievement',{data,idx:-1})
    })
})

//View:Add Achievements Edit/First time adding->POST Request
router.post('/add/achievement',isLoggedIn,isAdmin,(req,res)=>{
    console.log("req.body/ achievement",req.body)
    Alumni.findOne({_id:req.body.id},(err,data)=>{
        if(req.body.idx!='-1')
        {   
            data.achievements.splice(req.body.idx,1,req.body.achievement);
            console.log("data.achievements",data.achievements)
        }
        else{
            data.achievements.push(req.body.achievement);
        } 
        data.save().then((record)=>{
            console.log("data.achievements2",data.achievements)
            console.log("record",record)
            req.flash('success', 'Achievement Addedd successfully!');
            res.redirect(baseUrl+`/admin/alumni/${data._id}`);
        }).catch(err=>{
            console.log(err)
            res.redirect(baseUrl+`/admin/alumni/${data._id}`);
        })
    })
})
//View :Add Achievements ->edit->GET request
router.get('/:id/edit/achievement/:idx',isLoggedIn,isAdmin,(req,res)=>{
    Alumni.findOne({_id:req.params.id},(err,data)=>{
        res.render('admin/alumni/add_achievement',{data,idx:req.params.idx})
    })
})
//View :Add Achievement ->delete->GET request
router.get('/:id/delete/achievement/:idx',isLoggedIn,isAdmin,(req,res)=>{
    //console.log('req.params',req.params)
    Alumni.findOne({_id:req.params.id},(err,data)=>{
        data.achievements.splice(req.params.idx,1);
        data.save().then(()=>{
            res.redirect(baseUrl+`/admin/alumni/${req.params.id}`);
        })
    })
})

module.exports = router;