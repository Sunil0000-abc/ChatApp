const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
  participants: [
    { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  ],
  messages: [
    {
      sender: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
      content: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model("Conversation", conversationSchema);