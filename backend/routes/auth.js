// routes/auth.js
const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Recibe el id del usuario y devuelve un token que expira en 7 días
const generateToken = (id) => {
  return jwt.sign(
    { id },                          // payload: lo que guarda el token
    process.env.JWT_SECRET,          // clave secreta para firmarlo
    { expiresIn: "7d" }              // expira en 7 días
  );
};

// ─────────────────────────────────────────
// POST /api/auth/register
// Crea un usuario nuevo
// ─────────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validación básica — verifica que vengan los campos requeridos
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Nombre, correo y contraseña son obligatorios",
      });
    }

    // Verifica si ya existe un usuario con ese email
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        message: "Ya existe una cuenta con ese correo",
      });
    }

    // Crea el usuario — el modelo se encarga de encriptar la contraseña
    // gracias al middleware "pre save" que configuramos en User.js
    const user = await User.create({ name, email, password });

    // Genera el token con el _id del usuario recién creado
    const token = generateToken(user._id);

    // Responde con el token y los datos del usuario (sin contraseña)
    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        partnerId: user.partnerId,
        avatarColor: user.avatarColor,
      },
    });
  } catch (error) {
    // Error de validación de Mongoose (ej: email inválido, nombre muy corto)
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages[0] });
    }

    console.error("Error en register:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// ─────────────────────────────────────────
// POST /api/auth/login
// Inicia sesión con email y contraseña
// ─────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Correo y contraseña son obligatorios",
      });
    }

    // Buscamos el usuario incluyendo la contraseña
    // (normalmente viene con select: false, por eso el +password)
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );

    if (!user) {
      // Mensaje genérico — no revelamos si el email existe o no
      return res.status(401).json({
        message: "Credenciales incorrectas",
      });
    }

    // Compara la contraseña ingresada con el hash guardado
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Credenciales incorrectas",
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        partnerId: user.partnerId,
        avatarColor: user.avatarColor,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// ─────────────────────────────────────────
// GET /api/auth/me
// Devuelve el usuario logueado (ruta protegida)
// El frontend la usa para verificar si el token sigue siendo válido
// ─────────────────────────────────────────
router.get("/me", protect, async (req, res) => {
  // req.user viene del middleware protect
  res.status(200).json({
    user: {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      partnerId: req.user.partnerId,
      avatarColor: req.user.avatarColor,
    },
  });
});

module.exports = router;