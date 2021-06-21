const express = require('express');
const router = express.Router({ mergeParams: true });

const Club = require('../models/club');
const Review = require('../models/review');

const { reviewSchema } = require('../schemas.js');


const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}



router.post('/', validateReview, catchAsync(async (req, res) => {
    const club = await Club.findById(req.params.id);
    const review = new Review(req.body.review);
    club.reviews.push(review);
    await review.save();
    await club.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/clubs/${club._id}`);
}))

router.delete('/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Club.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/clubs/${id}`);
}))

module.exports = router;