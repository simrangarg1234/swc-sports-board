const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const spardhaSchema = new Schema({
    
	Clubname: { 
        type: String, 
        required: true 
    },
    Description: {
        type: String
    },
    DateTime: { 
        type: String, 
        required: true 
    },
    Status: { 
        type: String, 
    },
    Scorecard: { 
        type: String,
    },
    Images: { 
        type: [String] 
    },
    
});
var Spardha = mongoose.model('Spardha',spardhaSchema);

module.exports = Spardha;