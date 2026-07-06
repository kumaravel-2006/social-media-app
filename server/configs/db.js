import mongoose from "mongoose";
import dns from "dns";

const connectDB = async () => {
  try {
    dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

    mongoose.connection.on("connected", () => {
      console.log("Database Connected successfully! 🎉");
    });

    await mongoose.connect(process.env.MONGODB_URL);
  } catch (error) {
    console.error("Critical Database connection error: ❌ " + error.message);
    process.exit(1);
  }
};

export default connectDB;
