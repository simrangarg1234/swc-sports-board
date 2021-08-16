const express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');
const Alumni = require('../models/alumni');
const { isAdmin } = require("../middlewares/index");

router.get('/', async (req, res) => {
    const alumnis = await Alumni.find({}).sort({priority: 1});
    res.render('admin/alumni/index', {alumnis});
});

router.post('/', async (req, res) => {
    const data = req.body;
    const alumni = await new Alumni({
        priority: data.priority,
        name: data.name,
        image: data.image,
        email: data.email,
        experience: data.experience,
        achievements: data.achievements
    });
    await alumni.save();
    //req.flash('success', 'New member added successfully!');
    res.redirect('/admin/alumni');
});

router.get('/add', (req, res) => {
    res.render('admin/alumni/add');
});

router.get('/:id', catchAsync(async (req, res,) => {
    const alumni = await Alumni.findById(req.params.id);
    if (!alumni) {
        req.flash('error', 'Cannot find this member!');
        return res.redirect('/admin/alumni');
    }
    res.render('admin/alumni/show', { alumni });
}));

router.get('/:id/edit', catchAsync(async (req, res) => {
    const alumni = await Alumni.findById(req.params.id)
    if (!alumni) {
        req.flash('error', 'Cannot find this member!');
        return res.redirect('/admin/alumni');
    }
    res.render('admin/alumni/edit', { alumni });
}));
    
router.put('/:id', catchAsync(async (req, res) => {
    const id = req.params.id;
    const data = req.body;
    let alumni = await Alumni.findByIdAndUpdate(id, {
        priority: data.priority,
        name: data.name,
        image: data.image,
        email: data.email,
        experience:data.experience,
        achievements: data.achievements
    }, {new: true});
    if(!alumni) return res.status(404).send('Member with the given id not found');
    req.flash('success', 'Member details updated!');
    res.redirect(`/admin/alumni`);
}));
    
router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Alumni.findByIdAndDelete(id);
    req.flash('success', 'Member no longer exists!')
    res.redirect('/admin/alumni');
}));

module.exports = router;