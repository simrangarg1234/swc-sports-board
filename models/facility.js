const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FacilitySchema = new Schema({
  name: {
    type: String,
    required: true,
  },

  image: {
    type: [String],
    required: true,
  },

  info: {
    type: String,
    required: true,
  },
});
module.exports = mongoose.model("Facility", FacilitySchema);
