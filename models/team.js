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

// module.exports.Team = mongoose.model('Team', teamSchema);

// // module.exports.TeamSchema = Joi.object({
// //     team: Joi.object({
// //         priority: Joi.number().required(),
// //         name: Joi.string().required(),
// //         position: Joi.string().required(),
// //         image: Joi.string().required(),
// //         hostel: Joi.string().required(),
// //         contact1: Joi.string().required(),
// //         email: Joi.string().required()
// //     }).required()
// // });
// const validateTeam = (team) => {
//     const schema = {
//         priority: Joi.number().required(),
//         name: Joi.string().required(),
//         position: Joi.string().required(),
//         image: Joi.string().required(),
//         hostel: Joi.string().required(),
//         contact1: Joi.string().required(),
//         email: Joi.string().required()
//     }

//     return Joi.validate(team, schema);
// }



// module.exports.validate = validateTeam;