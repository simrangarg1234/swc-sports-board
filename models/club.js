const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;

const ClubSchema = new Schema({
    title: String,
    image: String,
    description: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

ClubSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Club', ClubSchema);