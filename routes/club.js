const express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');
const Club = require('../models/club');
const { isAdmin } = require("../middlewares/index");

router.get('/', async (req, res) => {
    res.render('admin/club/index');
});



router.post('/', async (req, res) => {
    const data = req.body;
    const club = await new Club({
        title:data.title,
        desc:data.desc,
        achievements:data.achievements,
        // score:req.files['pdf'][0];
    });
    await club.save();
    //req.flash('success', 'New Club added successfully!');
    res.redirect('/admin/club');
});

router.get('/add', (req, res) => {
    res.render('admin/club/add');
});

router.get('/:id', catchAsync(async (req, res,) => {
    const club = await club.findById(req.params.id);
    if (!club) {
        req.flash('error', 'Cannot find this member!');
        return res.redirect('/admin/club');
    }
    res.render('admin/club/show', { club });
}));

router.get('/:id/edit', catchAsync(async (req, res) => {
    const club = await club.findById(req.params.id)
    if (!club) {
        req.flash('error', 'Cannot find this member!');
        return res.redirect('/admin/club');
    }
    res.render('admin/club/edit', { club });
}));
    
router.put('/:id', catchAsync(async (req, res) => {
    const id = req.params.id;
    const data = req.body;
    let team = await Club.findByIdAndUpdate(id, {
        priority: data.priority,
        name: data.name,
        position: data.position,
        image: data.image,
        hostel: data.hostel,
        contact1: data.contact1,
        email: data.email
    }, {new: true});
    if(!team) return res.status(404).send('Member with the given id not found');
    req.flash('success', 'Member details updated!');
    res.redirect(`/admin/team`);
}));
    
router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Club.findByIdAndDelete(id);
    req.flash('success', 'Member no longer exists!')
    res.redirect('/admin/team');
}));

module.exports = router;