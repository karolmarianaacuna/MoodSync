// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,          // elimina espacios al inicio y al final
      minlength: [2, "El nombre debe tener al menos 2 caracteres"],
      maxlength: [50, "El nombre no puede superar 50 caracteres"],
    },
    email: {
      type: String,
      required: [true, "El correo es obligatorio"],
      unique: true,        // no puede haber dos usuarios con el mismo email
      lowercase: true,     // guarda siempre en minúsculas
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Ingresa un correo válido",
      ],
    },
    password: {
      type: String,
      required: [true, "La contraseña es obligatoria"],
      minlength: [6, "La contraseña debe tener al menos 6 caracteres"],
      // select: false significa que cuando hagas User.find(), 
      // la contraseña NO viene incluida por defecto (seguridad)
      select: false,
    },
    partnerId: {
      // Referencia al _id de otro User (la pareja)
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    pushToken: {
      // Token para notificaciones push (se llena más adelante)
      type: String,
      default: null,
    },
    avatarColor: {
      // Color del avatar generado automáticamente
      type: String,
      default: () => {
        const colors = [
          "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4",
          "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F",
        ];
        return colors[Math.floor(Math.random() * colors.length)];
      },
    },
  },
  {
    // timestamps: true agrega automáticamente createdAt y updatedAt
    timestamps: true,
  }
);

// MIDDLEWARE DE MONGOOSE — se ejecuta ANTES de guardar un usuario
// Encripta la contraseña solo si fue modificada (evita re-encriptar en updates)
userSchema.pre("save", async function (next) {
  // "this" es el documento que se está guardando
  if (!this.isModified("password")) {
    return next(); // Si la contraseña no cambió, continúa sin hacer nada
  }

  // bcrypt.genSalt(10) genera un "salt" — datos aleatorios que se mezclan
  // con la contraseña para que dos contraseñas iguales den hashes distintos
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// MÉTODO DE INSTANCIA — disponible en cualquier documento User
// Lo usarás en el login para comparar la contraseña ingresada con la guardada
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);