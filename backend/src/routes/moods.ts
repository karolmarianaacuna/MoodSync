import { Router, Response } from "express";
import Mood from "../models/Mood";
import { protect, AuthRequest } from "../middleware/auth";

const router = Router();

router.use(protect);

router.post("/", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { score, emoji, note, tags, isPublic } = req.body;

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const existingMood = await Mood.findOne({
      userId: req.user!._id,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    if (existingMood) {
      res.status(400).json({ message: "Ya registraste tu mood hoy" });
      return;
    }

    const mood = await Mood.create({
      userId: req.user!._id,
      score, emoji, note, tags, isPublic,
    });

    res.status(201).json({ mood });
  } catch (error) {
    if (error instanceof Error && error.name === "ValidationError") {
      const mongooseError = error as any;
      const messages = Object.values(mongooseError.errors).map((e: any) => e.message);
      res.status(400).json({ message: messages[0] });
      return;
    }
    console.error("Error creando mood:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

router.put("/today", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { score, emoji, note, tags, isPublic } = req.body;

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const mood = await Mood.findOneAndUpdate(
      { userId: req.user!._id, date: { $gte: startOfDay, $lte: endOfDay } },
      { score, emoji, note, tags, isPublic },
      { new: true, runValidators: true }
    );

    if (!mood) {
      res.status(404).json({ message: "No has registrado un mood hoy" });
      return;
    }

    res.status(200).json({ mood });
  } catch (error) {
    console.error("Error actualizando mood:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

router.get("/", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const moods = await Mood.find({ userId: req.user!._id })
      .sort({ date: -1 })
      .limit(limit);

    res.status(200).json({ moods });
  } catch (error) {
    console.error("Error obteniendo moods:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

router.get("/today", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const mood = await Mood.findOne({
      userId: req.user!._id,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    res.status(200).json({ mood });
  } catch (error) {
    console.error("Error obteniendo mood de hoy:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

router.get("/partner", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const partnerId = req.user!.partnerId;

    if (!partnerId) {
      res.status(400).json({ message: "No tienes una pareja conectada" });
      return;
    }

    const limit = parseInt(req.query.limit as string) || 10;
    const moods = await Mood.find({ userId: partnerId, isPublic: true })
      .sort({ date: -1 })
      .limit(limit);

    res.status(200).json({ moods });
  } catch (error) {
    console.error("Error obteniendo moods de la pareja:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

router.get("/partner/today", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const partnerId = req.user!.partnerId;

    if (!partnerId) {
      res.status(400).json({ message: "No tienes una pareja conectada" });
      return;
    }

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const mood = await Mood.findOne({
      userId: partnerId,
      isPublic: true,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    res.status(200).json({ mood });
  } catch (error) {
    console.error("Error obteniendo mood de hoy de la pareja:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

router.get("/sync", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const partnerId = req.user!.partnerId;

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const [myMood, partnerMood] = await Promise.all([
      Mood.findOne({ userId, date: { $gte: startOfDay, $lte: endOfDay } }),
      partnerId
        ? Mood.findOne({ userId: partnerId, isPublic: true, date: { $gte: startOfDay, $lte: endOfDay } })
        : null,
    ]);

    res.status(200).json({
      myMood,
      partnerMood,
      bothRegistered: !!myMood && !!partnerMood,
    });
  } catch (error) {
    console.error("Error en sync:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

export default router;