const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let userSchema = new Schema({
  name: { type: String, required: true },
  password: { type: String, required: true },
  id: { type: Number, required: true },
});

module.exports = mongoose.model("User", userSchema);
