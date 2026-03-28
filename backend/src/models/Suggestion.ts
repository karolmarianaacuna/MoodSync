import mongoose, { Document, Schema } from "mongoose";

export interface ISuggestion extends Document {
  coupleId: mongoose.Types.ObjectId;
  type: "activity" | "food" | "movie" | "music" | "rest";
  title: string;
  reason: string;
  moodTrigger: number;
  seen: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const suggestionSchema = new Schema<ISuggestion>(
  {
    coupleId: {
      type: Schema.Types.ObjectId,
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
      default: "",
    },
    moodTrigger: {
      type: Number,
      min: 1,
      max: 10,
    },
    seen: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Búsqueda rápida de sugerencias no vistas por pareja
suggestionSchema.index({ coupleId: 1, seen: 1 });

export default mongoose.model<ISuggestion>("Suggestion", suggestionSchema);