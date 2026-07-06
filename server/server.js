import express from "express";
import dotenv from "dotenv";
import connectDB from "./configs/db.js";
import authRoutes from "./routes/auth.js";
import verifyToken from "./middlewares/authMiddleware.js";
import postRoutes from "./routes/posts.js";
import userRoutes from "./routes/users.js";
import commentRoutes from "./routes/comments.js";

dotenv.config();

const app = express();

app.use(express.json());

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/api/comments", commentRoutes);

app.get("/api/protected-profile", verifyToken, (req, res) => {
  res.status(200).json({
    message: "Welcome to your premium private profile! 🔐",
    secretData: "This data is only visible to logged-in users.",
    userDataHiddenInPassport: req.user,
  });
});

app.get("/", (req, res) => {
  res.send("The Application is Running!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is happily running in port ${PORT}`);
});
