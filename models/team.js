const mongoose = require("mongoose");

const TeamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  management: [
    {
      position: { type: String, required: true },
      priority: { type: Number, required: true },
      photo: { type: String, required: true },
      contact1: { type: String },
      contact2: { type: String },
      email: { type: String, required: true },
    },
  ],
});

module.exports = mongoose.model("Team", TeamSchema);
