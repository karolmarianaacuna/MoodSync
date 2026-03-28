import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { protect, AuthRequest } from "../middleware/auth";

const router = Router();

const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, { expiresIn: "7d" });
};

router.post("/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: "Nombre, correo y contraseña son obligatorios" });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({ message: "Ya existe una cuenta con ese correo" });
      return;
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id.toString());

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
    if (error instanceof Error && error.name === "ValidationError") {
      const mongooseError = error as any;
      const messages = Object.values(mongooseError.errors).map((e: any) => e.message);
      res.status(400).json({ message: messages[0] });
      return;
    }
    console.error("Error en register:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Correo y contraseña son obligatorios" });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    if (!user) {
      res.status(401).json({ message: "Credenciales incorrectas" });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: "Credenciales incorrectas" });
      return;
    }

    const token = generateToken(user._id.toString());

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

router.get("/me", protect, async (req: AuthRequest, res: Response): Promise<void> => {
  const user = req.user!;
  res.status(200).json({
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      partnerId: user.partnerId,
      avatarColor: user.avatarColor,
    },
  });
});

export default router;