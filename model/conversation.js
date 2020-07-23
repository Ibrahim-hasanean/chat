const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const conversationSchema = new Schema(
  {
    from: { type: String, required: true },
    to: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: { currentTime: () => new Date().toLocaleString() } }
);

module.exports = mongoose.model("Conversation", conversationSchema);
