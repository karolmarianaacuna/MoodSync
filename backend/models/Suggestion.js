// models/Suggestion.js
const mongoose = require("mongoose");

const suggestionSchema = new mongoose.Schema(
  {
    coupleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Couple",
      required: true,
    },
    type: {
      type: String,
      enum: ["activity", "food", "movie", "music", "rest"],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    reason: {
      type: String,
      trim: true,
    },
    moodTrigger: {
      // El score promedio que disparó esta sugerencia
      type: Number,
      min: 1,
      max: 10,
    },
    seen: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Suggestion", suggestionSchema);