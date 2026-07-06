import express from "express";
import {
  createPost,
  getTimeline,
  likePost,
} from "../controllers/postController.js";
import verifyToken from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, createPost);

router.get("/timeline", verifyToken, getTimeline);

router.put("/:id/like", verifyToken, likePost);

export default router;
