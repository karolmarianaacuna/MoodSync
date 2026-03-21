// models/Mood.js
const mongoose = require("mongoose");

const moodSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "El userId es obligatorio"],
    },
    score: {
      type: Number,
      required: [true, "El score es obligatorio"],
      min: [1, "El score mínimo es 1"],
      max: [10, "El score máximo es 10"],
    },
    emoji: {
      type: String,
      required: [true, "El emoji es obligatorio"],
      // Solo permite estos emojis específicos
      enum: {
        values: ["😢", "😔", "😐", "🙂", "😊", "😄", "🥰", "😍", "🤩", "💫"],
        message: "Emoji no válido",
      },
    },
    note: {
      type: String,
      trim: true,
      maxlength: [300, "La nota no puede superar 300 caracteres"],
      default: "",
    },
    tags: {
      // Array de strings — ej: ["trabajo", "familia", "salud"]
      type: [String],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.length <= 5; // máximo 5 tags
        },
        message: "No puedes agregar más de 5 etiquetas",
      },
    },
    isPublic: {
      // Si true, la pareja puede ver esta entrada
      type: Boolean,
      default: true,
    },
    date: {
      // Fecha del registro — por defecto hoy
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Índice compuesto: buscar moods de un usuario en una fecha específica
// Esto acelera las consultas del dashboard
moodSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model("Mood", moodSchema);