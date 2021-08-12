const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const faqSchema=new Schema({
    qstn:{
        type:String
    },
    ans:{
        type:String
    }
})
const clubSchema = new Schema({
    title: { 
        type: String, 
        required: true
    },
    //Description
	  desc: { 
        type: String, 
        required: true 
    },
    //Achievements
    achievements: { 
        type: [String], 
    },
    //what we do
  	info: { 
        type: [String], 
    },
  	gallery: { 
          //images adress
        type: [String]
    },
    score: { 
        type: String
    },
    faq:{
        type:[faqSchema]
    }
});
var Club = mongoose.model('Club',clubSchema);

module.exports = Club;