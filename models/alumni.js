const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const alumniSchema = new Schema({
	name: { 
        type: String, 
        required: true 
    },
    image: { 
        type: String, 
        required: true 
    },
    email: {
        type: String, 
        required: true
    },
  	achievements: { 
        type: String, 
        required: true 
    }
    
});
var Alumnis = mongoose.model('Alumni',alumniSchema);

module.exports = Alumnis;