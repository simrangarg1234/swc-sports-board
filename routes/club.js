const express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');
const Club = require('../models/club');
const { isAdmin } = require("../middlewares/index");
const {upload}= require('../middlewares/index')
router.get('/', async (req, res) => {
    Club.find({},(err,data)=>{
        // console.log("data",data)
        res.render('admin/club/index',{clubs:data});
    })
    
});


var uploadval= upload.fields([{name:'images',maxCount:5},{name:'pdf',maxCount:1}])

router.post('/',uploadval, async (req, res) => {
    const data = req.body;
    console.log('Req.body',req.body,"\n");
    // console.log('req.files',req.files,'\n')
    const club = await new Club({
        title:data.title,
        desc:data.desc,
        info:data.info,
        achievements:data.achievements,
        score:req.files['pdf'][0].path
    });
    
    for(let i=0;i<req.files['images'].length;i++){
        club.gallery.push(req.files['images'][i].path);
    }
    console.log("club",club)
    await club.save();
    req.flash('success', 'New Club added successfully!');
    res.redirect('/admin/club/');
});

router.get('/add', (req, res) => {
    res.render('admin/club/add');
});

router.get('/view/:id',(req,res)=>{
    Club.findOne({_id:req.params.id},(err,data)=>{
        res.render('admin/club/view',{data})
    })
})

//For editing particular club
router.get('/:id/edit', catchAsync(async (req, res) => {
    const club = await Club.findById(req.params.id)
    if (!club) {
        req.flash('error', 'Cannot find this member!');
        return res.redirect('/admin/club');
    }
    res.render('admin/club/edit', { club });
}));
    

//Delete images
router.get('/:id/delimg/:idx/',(req,res)=>{
    Club.findOne({_id:req.params.id}).then(data=>{
        data.gallery.splice(req.params.idx,1);
        data.save().then(()=>{
            res.redirect(`/admin/club/${req.params.id}/edit`);
        })
    })
})

//Save updated data
router.post('/edit',uploadval,(req,res)=>{
    // console.log('Req.body',req.body,"\n");
    // console.log('req.files',req.files,'\n')
    Club.findOne({_id:req.body.clubid},(err,data)=>{
        data.title=req.body.club,
        data.desc=req.body.description,
        data.info=req.body.info,
        data.achievements=req.body.achievements;
        // console.log("req.files",req.files)
        //pdf 
        if(req.files['pdf']){
            data.score=req.files['pdf'][0].path;
        }  
        //images
        if(req.files['images']){
            for(let i=0;i<req.files['images'].length;i++){
                data.gallery.push(req.files['images'][i].path);
            }
        }
        
        data.save().then(()=>{
            req.flash('success', 'Club Updated successfully!');
            res.redirect('/admin/club');
        })
    });
})

//Delete club    
router.get('/:id/delete/', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Club.findByIdAndDelete(id);
    req.flash('success', 'Member no longer exists!')
    res.redirect('/admin/club');
}));

module.exports = router;