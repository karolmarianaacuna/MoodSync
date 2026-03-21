// routes/moods.js
const express = require("express");
const Mood = require("../models/Mood");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Todas las rutas de moods requieren autenticación
// protect se aplica a todas usando router.use()
router.use(protect);

// ─────────────────────────────────────────
// POST /api/moods
// Registra un nuevo estado de ánimo
// ─────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { score, emoji, note, tags, isPublic } = req.body;

    const mood = await Mood.create({
      userId: req.user._id, // viene del middleware protect
      score,
      emoji,
      note,
      tags,
      isPublic,
    });

    res.status(201).json({ mood });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages[0] });
    }

    console.error("Error creando mood:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// ─────────────────────────────────────────
// GET /api/moods
// Trae los moods del usuario logueado
// Acepta ?limit=10 para paginar
// ─────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const moods = await Mood.find({ userId: req.user._id })
      .sort({ date: -1 })  // más recientes primero
      .limit(limit);

    res.status(200).json({ moods });
  } catch (error) {
    console.error("Error obteniendo moods:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// ─────────────────────────────────────────
// GET /api/moods/today
// Trae el mood de hoy del usuario logueado
// ─────────────────────────────────────────
router.get("/today", async (req, res) => {
  try {
    // Calcula el inicio y fin del día de hoy
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const mood = await Mood.findOne({
      userId: req.user._id,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    // Si no registró hoy, devuelve null (no es un error)
    res.status(200).json({ mood });
  } catch (error) {
    console.error("Error obteniendo mood de hoy:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

module.exports = router;