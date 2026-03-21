// Aca estamos configurando la database
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // mongoose.connect devuelve una promesa, por eso usamos await
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error conectando a MongoDB: ${error.message}`);
    // Si no hay base de datos, no tiene sentido seguir
    // process.exit(1) cierra el proceso de Node con código de error
    process.exit(1);
  }
};

module.exports = connectDB;