import mongoose, { Document, Schema } from "mongoose";

export interface IMood extends Document {
  userId: mongoose.Types.ObjectId;
  score: number;
  emoji: string;
  note: string;
  tags: string[];
  isPublic: boolean;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const moodSchema = new Schema<IMood>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "El userId es obligatorio"],
    },
    score: {
      type: Number,
      required: [true, "El score es obligatorio"],
      min: [1, "Mínimo 1"],
      max: [10, "Máximo 10"],
    },
    emoji: {
      type: String,
      required: [true, "El emoji es obligatorio"],
      enum: {
        values: ["😢", "😔", "😐", "🙂", "😊", "😄", "🥰", "😍", "🤩", "💫"],
        message: "Emoji no válido",
      },
    },
    note: {
      type: String,
      trim: true,
      maxlength: [300, "Máximo 300 caracteres"],
      default: "",
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (arr: string[]) => arr.length <= 5,
        message: "Máximo 5 etiquetas",
      },
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Búsqueda rápida por usuario y fecha
moodSchema.index({ userId: 1, date: -1 });

export default mongoose.model<IMood>("Mood", moodSchema);