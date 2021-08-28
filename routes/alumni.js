const express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');
const Alumni = require('../models/alumni');
const { isAdmin } = require("../middlewares/index");
const { upload } = require("../middlewares/index");
var uploadval = upload.fields([{ name: "images", maxCount: 5 }]);

router.get('/', async (req, res) => {
    const alumnis = await Alumni.find({});
    res.render('admin/alumni/index', {alumnis});
});

router.post('/', uploadval, async (req, res) => {
    const data = req.body;
    const alumni = await new Alumni({
        name: data.name,
        email: data.email,
        experience: data.experience,
    })
    alumni.image = req.files["images"][0].path;

    await alumni.save();
    //req.flash('success', 'New member added successfully!');
    res.redirect('/admin/alumni');
});

router.get('/add', (req, res) => {
    res.render('admin/alumni/add');
});

router.get('/:id', catchAsync(async (req, res,) => {
    Alumni.findOne({_id:req.params.id},(err,data)=>{
        res.render('admin/alumni/show',{data})
    })
    //res.render('admin/alumni/show', { alumni });
}));

router.get('/:id/edit', catchAsync(async (req, res) => {
    const alumni = await Alumni.findById(req.params.id)
    if (!alumni) {
        req.flash('error', 'Cannot find this member!');
        return res.redirect('/admin/alumni');
    }
    res.render('admin/alumni/edit', { alumni });
}));
    
router.put('/:id', uploadval, catchAsync(async (req, res) => {

    const id = req.params.id;
    const data = req.body;
    console.log(req.body);
    const name =  data.name;
    const email =  data.email;
    const experience =  data.experience;
    
     
    let alumni = await Alumni.findByIdAndUpdate(id, {
        
        $set: {
            name,
            email,
            experience,
        }
    }, {new: true})
    if(req.files){
        alumni.image = req.files["images"][0].path;
    }
    req.flash('success', 'Member details updated!');
    res.redirect(`/admin/alumni`);
}));
    
router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Alumni.findByIdAndDelete(id);
    req.flash('success', 'Member no longer exists!')
    res.redirect('/admin/alumni');
}));

router.get('/:id/delimg/',(req,res)=>{
    Alumni.findOne({_id:req.params.id}).then(data=>{
        data.image = null;
        data.save().then(()=>{
            res.redirect(`/admin/alumni/${req.params.id}/edit`);
        })
    })
});

//View:Add Achievements->GET Request
router.get('/:id/add/achievement',(req,res)=>{
    Alumni.findOne({_id:req.params.id},(err,data)=>{
        res.render('admin/alumni/add_achievement',{data,idx:-1})
    })
})

//View:Add Achievements Edit/First time adding->POST Request
router.post('/add/achievement',(req,res)=>{
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
            res.redirect(`/admin/alumni/${data._id}`);
        }).catch(err=>{
            console.log(err)
            res.redirect(`/admin/alumni/${data._id}`);
        })
    })
})
//View :Add Achievements ->edit->GET request
router.get('/:id/edit/achievement/:idx',(req,res)=>{
    Alumni.findOne({_id:req.params.id},(err,data)=>{
        res.render('admin/alumni/add_achievement',{data,idx:req.params.idx})
    })
})
//View :Add Achievement ->delete->GET request
router.get('/:id/delete/achievement/:idx',(req,res)=>{
    //console.log('req.params',req.params)
    Alumni.findOne({_id:req.params.id},(err,data)=>{
        data.achievements.splice(req.params.idx,1);
        data.save().then(()=>{
            res.redirect(`/admin/alumni/${req.params.id}`)
        })
    })
})

module.exports = router;