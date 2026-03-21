// index.js
require("dotenv").config(); // carga las variables del .env — SIEMPRE primero

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database");

// Importa las rutas
const authRoutes = require("./routes/auth");
const moodRoutes = require("./routes/moods");

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Conectar a MongoDB ───────────────────
connectDB();

// ─── Middlewares globales ─────────────────

// CORS: permite peticiones desde el frontend
app.use(
  cors({
    origin: process.env.CLIENT_URL, // solo permite el origen configurado en .env
    credentials: true,              // permite enviar cookies si se necesitan
  })
);

// Parsea el body de las peticiones como JSON
// Sin esto, req.body sería undefined
app.use(express.json());

// Parsea datos de formularios HTML (por si se necesitan)
app.use(express.urlencoded({ extended: true }));

// ─── Rutas ────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/moods", moodRoutes);

// Ruta de salud — sirve para verificar que el servidor está corriendo
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "MoodSync API corriendo",
    timestamp: new Date().toISOString(),
  });
});

// Maneja rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ message: `Ruta ${req.originalUrl} no encontrada` });
});

// ─── Iniciar servidor ─────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});