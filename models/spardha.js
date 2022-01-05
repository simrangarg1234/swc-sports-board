const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const detailSchema = new Schema({
    Clubname: { 
        type: String,
        required: true
    },
    Description: {
        type: String,
        required: true
    },
    DateTime: { 
        type: String,
        required: true
    },
    image: {
        type: String,
    },
    Scorecard: { 
        type: String,
    }
})
const spardhaSchema = new Schema({
    
    Year: {
        type: String,
        required: true
    },
    Status: { 
        type: String
    },
    Images: { 
        type: [String] 
    },
    details: {
        type: [detailSchema]
    }
});
var Spardha = mongoose.model('Spardha',spardhaSchema);

module.exports = Spardha;