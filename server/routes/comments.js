import express from "express";
import {
  addComment,
  getCommentsByPost,
} from "../controllers/commentController.js";
import verifyToken from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/:postId", verifyToken, addComment);

router.get("/:postId", verifyToken, getCommentsByPost);

export default router;
