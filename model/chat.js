let mongoose = require("mongoose");

let chatSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    from: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.module("Chat", chatSchema);
