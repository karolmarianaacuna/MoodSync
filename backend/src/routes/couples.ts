import { Router, Response } from "express";
import User from "../models/User";
import Couple from "../models/Couple";
import { protect, AuthRequest } from "../middleware/auth";

const router = Router();

router.use(protect);

router.post("/generate", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;

    if (req.user!.partnerId) {
      res.status(400).json({ message: "Ya tienes una pareja conectada" });
      return;
    }

    const existingCouple = await Couple.findOne({ user1: userId, status: "pending" });
    if (existingCouple) {
      res.status(200).json({
        inviteCode: existingCouple.inviteCode,
        message: "Ya tienes un código activo",
      });
      return;
    }

    const couple = await Couple.create({ user1: userId });

    res.status(201).json({
      inviteCode: couple.inviteCode,
      message: "Código generado — compártelo con tu pareja",
    });
  } catch (error) {
    console.error("Error generando código:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

router.post("/join", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { inviteCode } = req.body;
    const userId = req.user!._id;

    if (!inviteCode) {
      res.status(400).json({ message: "El código de invitación es obligatorio" });
      return;
    }

    if (req.user!.partnerId) {
      res.status(400).json({ message: "Ya tienes una pareja conectada" });
      return;
    }

    const couple = await Couple.findOne({
      inviteCode: inviteCode.toUpperCase(),
      status: "pending",
    });

    if (!couple) {
      res.status(404).json({ message: "Código inválido o ya utilizado" });
      return;
    }

    if (couple.user1.toString() === userId.toString()) {
      res.status(400).json({ message: "No puedes usar tu propio código" });
      return;
    }

    couple.user2 = userId;
    couple.status = "active";
    couple.since = new Date();
    await couple.save();

    await User.findByIdAndUpdate(couple.user1, { partnerId: userId });
    await User.findByIdAndUpdate(userId, { partnerId: couple.user1 });

    res.status(200).json({
      message: "Pareja conectada exitosamente",
      couple: {
        _id: couple._id,
        status: couple.status,
        since: couple.since,
        inviteCode: couple.inviteCode,
      },
    });
  } catch (error) {
    console.error("Error uniendo pareja:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

router.get("/me", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;

    const couple = await Couple.findOne({
      $or: [{ user1: userId }, { user2: userId }],
      status: "active",
    })
      .populate("user1", "name email avatarColor")
      .populate("user2", "name email avatarColor");

    res.status(200).json({ couple: couple || null });
  } catch (error) {
    console.error("Error obteniendo pareja:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

router.delete("/disconnect", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;

    const couple = await Couple.findOne({
      $or: [{ user1: userId }, { user2: userId }],
      status: "active",
    });

    if (!couple) {
      res.status(404).json({ message: "No tienes una pareja activa" });
      return;
    }

    await User.findByIdAndUpdate(couple.user1, { partnerId: null });
    await User.findByIdAndUpdate(couple.user2, { partnerId: null });
    await Couple.findByIdAndDelete(couple._id);

    res.status(200).json({ message: "Pareja desconectada" });
  } catch (error) {
    console.error("Error desconectando pareja:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

export default router;