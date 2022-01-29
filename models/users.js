const mongoose = require("mongoose");


const UserSchema = new mongoose.Schema({
  email: { type: String, required: true },
  accessToken: { type: String, required: true, select: false },
  name: { type: String },
  isAdmin: { type: Boolean, default: false },
});


module.exports = mongoose.model("User", UserSchema);
