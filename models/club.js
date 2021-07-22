const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const clubSchema = new Schema({
    title: { 
        type: Number, 
        required: true
    },
    //Description
	  desc: { 
        type: String, 
        required: true 
    },
    //Achievements
    achievements: { 
        type: String, 
    },
    //what we do
  	info: { 
        type: String, 
        required: true 
    },
  	gallery: { 
          //images adress
        type: [String]
    },
    score: { 
        type: String
    }
});
var Clubs = mongoose.model('Club',clubSchema);

module.exports = Clubs;