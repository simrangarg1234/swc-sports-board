const mongoose = require("mongoose");
var findOrCreate = require("mongoose-findorcreate");

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true },
  name: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  role: { type: String, default: "NA" },
  outlookId: { type: String, required: true },
});

UserSchema.plugin(findOrCreate);
module.exports = mongoose.model("User", UserSchema);
