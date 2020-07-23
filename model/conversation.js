const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const conversationSchema = new Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  msg: { type: String, required: true },
  houre: { type: String, required: true },
  minutes: { type: String },
});

module.exports = mongoose.model("Conversation", conversationSchema);
