import mongoose, { Document, Schema } from "mongoose";
import crypto from "crypto";

export interface ICouple extends Document {
  user1: mongoose.Types.ObjectId;
  user2: mongoose.Types.ObjectId | null;
  inviteCode: string;
  status: "pending" | "active";
  since: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const coupleSchema = new Schema<ICouple>(
  {
    user1: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    user2: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    inviteCode: {
      type: String,
      default: () => crypto.randomBytes(4).toString("hex").toUpperCase(),
      unique: true,
    },
    status: {
      type: String,
      enum: ["pending", "active"],
      default: "pending",
    },
    since: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Búsqueda rápida por código de invitación
coupleSchema.index({ inviteCode: 1 });

export default mongoose.model<ICouple>("Couple", coupleSchema);