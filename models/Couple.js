// models/Couple.js
const mongoose = require("mongoose");

const coupleSchema = new mongoose.Schema(
  {
    user1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    user2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // null hasta que alguien acepte la invitación
    },
    inviteCode: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["pending", "active"],
      default: "pending",
    },
    since: {
      // Fecha desde que la pareja está activa
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Couple", coupleSchema);