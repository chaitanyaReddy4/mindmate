const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    text: {
      type: String,
      required: true,
      trim: true
    },
    emotion: {
      type: String,
      default: ""
    },
    type: {
      type: String,
      enum: ["user", "bot"],
      required: true
    },
    time: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
