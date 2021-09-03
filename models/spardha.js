const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const detailSchema = new Schema({
    Clubname: { 
        type: String
    },
    Description: {
        type: String
    },
    DateTime: { 
        type: String
    },
})
const spardhaSchema = new Schema({
    
    Year: {
        type: String,
        
    },
    Status: { 
        type: String
    },
    Scorecard: { 
        type: String,
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