import express from "express";
import {
  createPost,
  getTimeline,
  likePost,
  getUserPosts,
  updatePost,
  deletePost
} from "../controllers/postController.js";
import verifyToken from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, createPost);

router.get("/timeline", verifyToken, getTimeline);

router.put("/:id/like", verifyToken, likePost);

router.get("/profile/:username", verifyToken, getUserPosts);

router.put("/:id", verifyToken, updatePost);

router.delete("/:id", verifyToken, deletePost);


export default router;
