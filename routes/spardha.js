const express = require('express');
var router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Spardha = require('../models/spardha');
const { isAdmin } = require("../middlewares/index");
const {upload}= require('../middlewares/index')
var uploadval= upload.fields([{name:'images',maxCount:10},{name:'pdf',maxCount:1}])

//Events List
router.get('/', async (req, res) => {
    const spardhas = await Spardha.find({});
    res.render('admin/spardha/index', {spardhas});
});

//Add event - POST
router.post('/', async (req, res) => {
    const data = req.body;
    const spardha = await new Spardha({
        
        Clubname: data.Clubname,
        Description: data.Description,
        DateTime: data.DateTime,
        Status: data.Status,
    });
    await spardha.save();
    //req.flash('success', 'New member added successfully!');
    res.redirect('/admin/spardha');
});

//Add Event - get
router.get('/add', (req, res) => {
    res.render('admin/spardha/add');
});

//View - get
router.get('/:id', catchAsync(async (req, res,) => {
    const spardha = await Spardha.findById(req.params.id);
    if (!spardha) {
        req.flash('error', 'Cannot find this club!');
        return res.redirect('/admin/spardha');
    }
    res.render('admin/spardha/show', { spardha });
}));

//Event edit - GET
router.get('/:id/edit', catchAsync(async (req, res) => {
    const spardha = await Spardha.findById(req.params.id)
    if (!spardha) {
        req.flash('error', 'Cannot find this club!');
        return res.redirect('/admin/spardha');
    }
    res.render('admin/spardha/edit', { spardha });
}));
   
//Event edit - POST
router.put('/:id', catchAsync(async (req, res) => {
    const id = req.params.id;
    const data = req.body;
    let spardha = await Spardha.findByIdAndUpdate(id, {
        
        Clubname: data.Clubname,
        Description: data.Description,
        DateTime: data.DateTime,
        Status: data.Status,
    }, {new: true});
    if(!spardha) return res.status(404).send('Clubname with the given id not found');
    req.flash('success', 'Event details updated!');
    res.redirect(`/admin/spardha`);
}));
   
//Event delete
router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Spardha.findByIdAndDelete(id);
    req.flash('success', 'Club no longer exists!')
    res.redirect('/admin/spardha');
}));

//Save updated images and pdf/Score Card
router.post('/imgpdf',uploadval,(req,res)=>{
    Spardha.findOne({_id:req.body.id},(err,data)=>{
        //pdf :Score Card
        if(req.files['pdf']){
            data.Scorecard=req.files['pdf'][0].path;
        }  
        //images: Gallery
        if(req.files['images']){
            for(let i=0;i<req.files['images'].length;i++){
                data.Images.push(req.files['images'][i].path);
            }
        }
        data.save().then(()=>{
            req.flash('success', 'Event Updated successfully!');
            res.redirect('/admin/spardha');
        })
    });
});

//Delete images by clicking on X :Sub part of View->images
router.get('/:id/delimg/:idx/',(req,res)=>{
    Spardha.findOne({_id:req.params.id}).then(data=>{
        data.Images.splice(req.params.idx,1);
        data.save().then(()=>{
            res.redirect(`/admin/spardha/${req.params.id}`);
        })
    })
})

module.exports = router;