const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const alumniSchema = new Schema({
	name: { 
        type: String, 
        required: true 
    },
    image: { 
        type: String 
    },
    email: {
        type: String, 
        required: true
    },
    experience: { 
        type: String, 
        required: true 
    },
  	achievements: { 
        type: [String]
    }
});
var Alumnis = mongoose.model('Alumni',alumniSchema);

module.exports = Alumnis;