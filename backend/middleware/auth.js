// middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Este middleware protege las rutas que requieren sesión iniciada
// Si el token es válido, agrega req.user con los datos del usuario
// Si no, responde con 401 y el request se detiene aquí

const protect = async (req, res, next) => {
  let token;

  // Los tokens JWT se envían en el header Authorization así:
  // Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1]; // extrae solo el token
  }

  if (!token) {
    return res.status(401).json({
      message: "No autorizado — falta el token",
    });
  }

  try {
    // jwt.verify lanza un error si el token es inválido o expiró
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Busca el usuario en la DB con el id que viene en el token
    // select("+password") NO está aquí porque no necesitamos la contraseña
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        message: "No autorizado — usuario no encontrado",
      });
    }

    // Agrega el usuario al objeto request para usarlo en la ruta
    req.user = user;
    next(); // continúa al siguiente middleware o al handler de la ruta
  } catch (error) {
    return res.status(401).json({
      message: "No autorizado — token inválido o expirado",
    });
  }
};

module.exports = { protect };