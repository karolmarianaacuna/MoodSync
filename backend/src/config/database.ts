// src/config/database.ts
import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error("MONGODB_URI no está definida en las variables de entorno");
    }

    const conn = await mongoose.connect(mongoURI);
    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`❌ Error conectando a MongoDB: ${error.message}`);
    }
    process.exit(1);
  }
};

export default connectDB;