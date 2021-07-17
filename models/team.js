const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const teamSchema = new Schema({
    priority: { 
        type: Number, 
        required: true
    },
	name: { 
        type: String, 
        required: true 
    },
    position: { 
        type: String, 
        required: true 
    },
  	image: { 
        type: String, 
        required: true 
    },
  	hostel: { 
        type: String, 
        required: true 
    },
    contact1: { 
        type: String,
        required: true
    },
    contact2: { 
        type: String 
    },
    email: { 
        type: String, 
        required: true 
    }
});
var Teams = mongoose.model('Team',teamSchema);

module.exports = Teams;