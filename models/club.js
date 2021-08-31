const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const headSchema= new Schema({
    name:{
        type:String,
        required:true
    },
    position:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    contact:{
        type:String
    },
    email:{
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
        type: String
    },
    //Aboutus
    about:{
        type:String
    },
    //Heads
    heads:{
        type:[headSchema]
    },
    //Achievements
    achievements: { 
        type: [String]
    },
    //what we do
  	info: { 
        type: [String] 
    },
    //Past evets
    pe: {
        type:[String]
    },
  	gallery: { 
          //images adress
        type: [String]
    },
    score: { 
        type: String
    }
});
var Club = mongoose.model('Club',clubSchema);

module.exports = Club;