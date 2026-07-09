import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./configs/db.js";
import authRoutes from "./routes/auth.js";
import verifyToken from "./middlewares/authMiddleware.js";
import postRoutes from "./routes/posts.js";
import userRoutes from "./routes/users.js";
import commentRoutes from "./routes/comments.js";
import chatRoutes from "./routes/chats.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: "Too many requests from this IP, please try again later." }
});
app.use("/api/", limiter);

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/chats", chatRoutes);

app.get("/api/protected-profile", verifyToken, (req, res) => {
  res.status(200).json({
    message: "Welcome to your premium private profile!",
    secretData: "This data is only visible to logged-in users.",
    userDataHiddenInPassport: req.user,
  });
});

app.get("/", (req, res) => {
  res.send("The Application is Running!");
});

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

let activeUsers = [];

io.on("connection", (socket) => {
  console.log(`A user connected to chat engine: ${socket.id}`);
  socket.on("addUser", (userId) => {
    activeUsers = activeUsers.filter((user) => user.userId !== userId);
    activeUsers.push({ userId, socketId: socket.id });
    io.emit("getUsers", activeUsers);
  });
  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    const user = activeUsers.find((user) => user.userId === receiverId);
    if (user) {
      io.to(user.socketId).emit("getMessage", {
        senderId,
        text,
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected from chat engine.");
    activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
    io.emit("getUsers", activeUsers);
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Secure Server + Socket.io running happily on port ${PORT}`);
});
