const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EventSchema = new Schema({
    name: { 
        type: String, 
        required: true
    },
    //Description
	  desc: { 
        type: String
    },
    
    
    //dates
  	date: { 
        type: String, 
    },

  	image: { 
          //images adress
        type: String
    },
    score: { 
        type: String,
    }
});

module.exports = mongoose.model("Event", EventSchema);