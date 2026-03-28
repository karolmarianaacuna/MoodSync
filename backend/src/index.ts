import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/database";
import authRoutes from "./routes/auth";
import moodRoutes from "./routes/moods";
import coupleRoutes from "./routes/couples";

const app = express();
const PORT = process.env.PORT || 4000;

connectDB();

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/moods", moodRoutes);
app.use("/api/couples", coupleRoutes);

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    message: "MoodSync API corriendo",
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res) => {
  res.status(404).json({ message: `Ruta ${req.originalUrl} no encontrada` });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});