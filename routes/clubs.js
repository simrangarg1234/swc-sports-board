const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { clubSchema } = require('../schemas.js');

const ExpressError = require('../utils/ExpressError');
const Club = require('../models/club');

const validateClub = (req, res, next) => {
    const { error } = clubSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

router.get('/', catchAsync(async (req, res) => {
    const clubs = await Club.find({});
    res.render('clubs/index', { clubs })
}));

router.get('/new', (req, res) => {
    res.render('clubs/new');
})


router.post('/', validateClub, catchAsync(async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const club = new Club(req.body.club);
    await club.save();
    req.flash('success', 'New club added successfully!');
    res.redirect(`/clubs/${club._id}`)
}))

router.get('/:id', catchAsync(async (req, res,) => {
    const club = await Club.findById(req.params.id).populate('reviews');
    if (!club) {
        req.flash('error', 'Cannot find that club!');
        return res.redirect('/clubs');
    }
    res.render('clubs/show', { club });
}));

router.get('/:id/edit', catchAsync(async (req, res) => {
    const club = await Club.findById(req.params.id)
    if (!club) {
        req.flash('error', 'Cannot find club!');
        return res.redirect('/clubs');
    }
    res.render('clubs/edit', { club });
}))

router.put('/:id', validateClub, catchAsync(async (req, res) => {
    const { id } = req.params;
    const club = await Club.findByIdAndUpdate(id, { ...req.body.club });
    req.flash('success', 'Club updated!');
    res.redirect(`/clubs/${club._id}`)
}));

router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Club.findByIdAndDelete(id);
    req.flash('success', 'Club no longer exists!')
    res.redirect('/clubs');
}));

module.exports = router;