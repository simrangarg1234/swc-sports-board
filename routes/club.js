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

//Create Club
router.post('/create',async(req,res)=>{
    const data= req.body;

    console.log("Create Req.body",req.body);
    const club= await new Club({
        title:data.title,
        desc:data.desc
    })
    await club.save();
    res.redirect('/admin/club/')
})

var uploadval= upload.fields([{name:'images',maxCount:5},{name:'pdf',maxCount:1}])

//Not using this. This is previously used for creating and updating data of club
router.post('/',uploadval, async (req, res) => {
    const data = req.body;
    console.log('Req.body',req.body,"\n");
    // console.log('req.files',req.files,'\n')
    const club = await new Club({
        title:data.title,
        desc:data.desc,
        info:data.info,
        score:req.files['pdf'][0].path
    });
    
    for(let i=0;i<req.files['images'].length;i++){
        club.gallery.push(req.files['images'][i].path);
    }
    var temp={
        qstn:req.body.qstn,
        ans:req.body.ans
    }
    club.faq.push(temp);
    club.achievements.push(req.body.achievements);
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


//Save updated data
router.post('/edit',uploadval,(req,res)=>{
    Club.findOne({_id:req.body.clubid},(err,data)=>{
        data.title=req.body.club,
        data.desc=req.body.description,
        data.info=req.body.info;
        console.log("req.body",req.body)
        
        //Achievements
        if(req.body.achievements){
            
            data.achievements.splice(0,data.achievements.length);
            
            if(Array.isArray(req.body.achievements)){
                for(let i=0;i<req.body.achievements.length;i++){
                    if(req.body.achievements[i]!=''&&req.body.achievements[i].length>1)
                    data.achievements.push(req.body.achievements[i]);
                }
            }
            else{
                data.achievements.push(req.body.achievements);
            }
            
        }
        //What we do
        if(req.body.info){
            
            data.info.splice(0,data.info.length);
            
            if(Array.isArray(req.body.info)){
                for(let i=0;i<req.body.info.length;i++){
                    if(req.body.info[i]!=''&&req.body.info[i].length>1)
                    data.info.push(req.body.info[i]);
                }
            }
            else{
                data.info.push(req.body.info);
            }
            
        }
        
        // console.log("req.files",req.files)
        //pdf :Score Card
        if(req.files['pdf']){
            data.score=req.files['pdf'][0].path;
        }  
        //images: Gallery
        if(req.files['images']){
            for(let i=0;i<req.files['images'].length;i++){
                data.gallery.push(req.files['images'][i].path);
            }
        }
        //Faqs 
        if(req.body.qstn){
            //Removing previous data Since new data can be edited 
            data.faq.splice(0,data.faq.length);
            //If we get an array
            if(Array.isArray(req.body.qstn)){
                for(let i=0;i<req.body.qstn.length;i++){
                    if(req.body.qstn[i]!=''&&req.body.ans[i]!=''){
                        data.faq.push({
                            qstn:req.body.qstn[i],
                            ans:req.body.ans[i]
                        })
                    }
                }
            }
            //If we get a single object
            else{
                if(req.body.qstn!=''&&req.body.ans!='')
                data.faq.push({
                    qstn:req.body.qstn,
                    ans:req.body.ans
                })
            }
        }
        
        data.save().then(()=>{
            req.flash('success', 'Club Updated successfully!');
            res.redirect('/admin/club');
        })
    });
})

//Delete images by clicking on X :Sub part of Update or Edit 
router.get('/:id/delimg/:idx/',(req,res)=>{
    Club.findOne({_id:req.params.id}).then(data=>{
        data.gallery.splice(req.params.idx,1);
        data.save().then(()=>{
            res.redirect(`/admin/club/${req.params.id}/edit`);
        })
    })
})

//Delete club    
router.get('/:id/delete/', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Club.findByIdAndDelete(id);
    req.flash('success', 'Member no longer exists!')
    res.redirect('/admin/club');
}));

module.exports = router;