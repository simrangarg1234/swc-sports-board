const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const photoGallerySchema = new Schema({
    homeGallery: {
        type: [String]
    },
    clubGallery: {
        type: [String]
    },
    teamGallery: {
        type: [String]
    },
    facilityGallery: {
        type: [String]
    },
    spardhaGallery: {
        type: [String]
    },
});

var PhotoGalleries = mongoose.model('PhotoGallery',photoGallerySchema);

module.exports = PhotoGalleries;