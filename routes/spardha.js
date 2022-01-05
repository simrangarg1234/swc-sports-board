const express = require('express');
var router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Spardha = require('../models/spardha');
const Gallery = require('../models/photogallery');
const { isLoggedIn,isAdmin } = require("../middlewares/index");
const {upload}= require('../middlewares/index')
var uploadval= upload.fields([{name:'images',maxCount:10},{name:'pdf',maxCount:1}])
require("dotenv").config();
const fs = require('fs');
const baseUrl = process.env.BaseUrl;

var uploadhead=upload.fields([{name:'images',maxcount:1}]);

//Events List
router.get('/',isLoggedIn,isAdmin, async (req, res) => {
    const spardhas = await Spardha.find({}).sort({Year: -1});
    const gal = await Gallery.find({} , { spardhaGallery: 1});
    const gallery = gal[0].spardhaGallery;
    res.render('admin/spardha/index', {spardhas,gallery});
});

//Add event - POST
router.post('/',isLoggedIn,isAdmin, async (req, res) => {
    const data = req.body;
    const spardha = await new Spardha({
        
        Year: data.Year,
        Status: data.Status
    });
    await spardha.save();
    //req.flash('success', 'New member added successfully!');
    res.redirect(baseUrl+'/admin/spardha');
});

//Add Event - get
router.get('/add',isLoggedIn,isAdmin, (req, res) => {
    res.render('admin/spardha/add');
});

router.post("/gallery", isLoggedIn, isAdmin, uploadval, async (req, res) => {

    if(req.files){
        const gallery = await Gallery.find({});
        if(gallery.length == 0) {
            var data = await new Gallery({});
            data.spardhaGallery.push(req.files["images"][0].path);
            data.save().then((record)=>{
                console.log("record",record);
                res.redirect(baseUrl+'/admin/spardha/');
            }).catch(err=>{
                console.log(err)
                res.redirect(baseUrl+'/admin/spardha/');
            });
        } else {
            Gallery.find({}, (err, data) => {
                data[0].spardhaGallery.push(req.files["images"][0].path);
                data[0].save().then((record)=>{
                    console.log("record",record);
                    res.redirect(baseUrl+'/admin/spardha/');
                }).catch(err=>{
                    console.log(err)
                    res.redirect(baseUrl+'/admin/spardha/');
                });
            })
        }
    } else {
        res.redirect(baseUrl+'/admin/spardha/');
    }
});

router.get("/gallery/:idx", isLoggedIn, isAdmin, async (req, res) => {
    Gallery.find({}, {spardhaGallery: 1},(err,data)=>{
        if (data[0].spardhaGallery!=null) {
            fs.unlink(`${data[0].spardhaGallery[req.params.idx]}`, (err) => {
              if (err) {
                console.error(err);
                return res.send(err);
              }});
        }
        data[0].spardhaGallery.splice(req.params.idx,1);
        data[0].save().then(()=>{
            res.redirect(baseUrl+`/admin/spardha`);
        })
    })
});

//View - get
router.get('/:id',isLoggedIn,isAdmin, catchAsync(async (req, res,) => {
    const spardha = await Spardha.findById(req.params.id);
    if (!spardha) {
        req.flash('error', 'Cannot find this club!');
        return res.redirect(baseUrl+'/admin/spardha');
    }
    res.render('admin/spardha/show', { spardha });
}));

//Event edit - GET
router.get('/:id/edit',isLoggedIn,isAdmin, catchAsync(async (req, res) => {
    const spardha = await Spardha.findById(req.params.id)
    if (!spardha) {
        req.flash('error', 'Cannot find this club!');
        return res.redirect(baseUrl+'/admin/spardha');
    }
    res.render('admin/spardha/edit', { spardha });
}));
   
//Event edit - POST
router.put('/:id',isLoggedIn,isAdmin, catchAsync(async (req, res) => {
    const id = req.params.id;
    const data = req.body;
    let spardha = await Spardha.findByIdAndUpdate(id, {
        
        Year: data.Year,
        Status: data.Status,
    }, {new: true});
    if(!spardha) return res.status(404).send('Clubname with the given id not found');
    req.flash('success', 'Event details updated!');
    res.redirect(baseUrl+'/admin/spardha');
}));
   
//Event delete
router.delete('/:id',isLoggedIn,isAdmin, catchAsync(async (req, res) => {
    const { id } = req.params;
    Spardha.findOne({_id:req.body.id},(err,data)=>{
        for(let i=0;i<data.details.length; i++){
            if (data.details[i].image!=null && event.image.indexOf("https://") == -1) {
                fs.unlink(`${data.details[i].image}`, (err) => {
                  if (err) {
                    console.error(err);
                    return res.send(err);
                    }
                })
            }
            if (data.details[i].Scorecard!=null) {
                fs.unlink(`${data.details[i].Scorecard}`, (err) => {
                  if (err) {
                    console.error(err);
                    return res.send(err);
                    }
                })
            }
        }
    });
    await Spardha.findByIdAndDelete(id);
    req.flash('success', 'Club no longer exists!')
    res.redirect(baseUrl+'/admin/spardha');
}));

//Save updated images and pdf/Score Card
router.post('/imgpdf',isLoggedIn,isAdmin,uploadval,(req,res)=>{
    Spardha.findOne({_id:req.body.id},(err,data)=>{ 
        //images: Gallery
        if(req.files['images']){
            for(let i=0;i<req.files['images'].length;i++){
                data.Images.push(req.files['images'][i].path);
            }
        }
        data.save().then(()=>{
            req.flash('success', 'Event Updated successfully!');
            res.redirect(baseUrl+'/admin/spardha');
        })
    });
});

//Delete images by clicking on X :Sub part of View->images
router.get('/:id/delimg/:idx/',isLoggedIn,isAdmin,(req,res)=>{
    Spardha.findOne({_id:req.params.id}).then(data=>{
        if (data.Images!=null) {
            fs.unlink(`${data.Images[req.params.idx]}`, (err) => {
              if (err) {
                console.error(err);
                return res.send(err);
              }});
        }
        data.Images.splice(req.params.idx,1);
        data.save().then(()=>{
            res.redirect(baseUrl + `/admin/spardha/${req.params.id}`);
        })
    })
});
//View:Add details->Get Request
router.get('/:id/add/event',isLoggedIn,isAdmin,(req,res)=>{
    Spardha.findOne({_id:req.params.id},(err,data)=>{
        res.render('admin/spardha/add_event',{data,idx:-1})
    })
})

//View:Add Details Edit/First time adding->POST Request
router.post('/add/event', isLoggedIn,isAdmin,uploadval,(req,res)=>{
    var detail={
        Clubname:req.body.Clubname,
        Description:req.body.Description,
        DateTime:req.body.DateTime,
    };

    Spardha.findOne({_id:req.body.id},(err,data)=>{

        if(req.body.idx!='-1') {   
            if (req.files["images"]) { 
                if( data.details[req.body.idx].image!=null) {
                  fs.unlink(`${data.details[req.body.idx].image}`, (err) => {
                  if (err) {
                    console.error(err);
                    return res.send(err);
                  }});
                } 
                detail.image= req.files["images"][0].path;
            } else {
                if( data.details[req.body.idx].image!=null) {
                    detail.image= data.details[req.body.idx].image;
                }
            }
            if (req.files["pdf"]) { 
                if( data.details[req.body.idx].Scorecard!=null) {
                fs.unlink(`${data.details[req.body.idx].Scorecard}`, (err) => {
                  if (err) {
                    console.error(err);
                    return res.send(err);
                  }});
                } 
                detail.Scorecard= req.files["pdf"][0].path;
            } else {
                if( data.details[req.body.idx].Scorecard!=null) {
                    detail.Scorecard= data.details[req.body.idx].Scorecard;
                }
            }
            data.details.splice(req.body.idx,1,detail);

        } else{
            if(req.files["images"]) {
                detail.image= req.files["images"][0].path;
            }
            if(req.files["pdf"]) {
                detail.Scorecard= req.files["pdf"][0].path;
            }
            data.details.push(detail);
        } 

        data.save().then((record)=>{
            req.flash('success', 'Event Addedd successfully!');
            res.redirect(baseUrl+`/admin/spardha/${data._id}`);
        }).catch(err=>{
            console.log(err)
            res.redirect(baseUrl+`/admin/spardha/${data._id}`);
        })
    })
});

//View :Add Details ->edit->GET request
router.get('/:id/edit/event/:idx',isLoggedIn,isAdmin,(req,res)=>{
    Spardha.findOne({_id:req.params.id},(err,data)=>{
        res.render('admin/spardha/add_event',{data,idx:req.params.idx})
    })
})
//View :Add Details ->delete->GET request
router.get('/:id/delete/event/:idx',isLoggedIn,isAdmin,(req,res)=>{
    Spardha.findOne({_id:req.params.id},(err,data)=>{
        if (data.details[req.params.idx].image!=null) {
            fs.unlink(`${data.details[req.params.idx].image}`, (err) => {
              if (err) {
                console.error(err);
                return res.send(err);
              }});
        }
        data.details.splice(req.params.idx,1);
        data.save().then(()=>{ 
            res.redirect(baseUrl+`/admin/spardha/${req.params.id}`)
        })
    })
})
module.exports = router;