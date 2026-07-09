import express from "express";
import {
  addComment,
  deleteComment,
  getCommentsByPost,
} from "../controllers/commentController.js";
import verifyToken from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/:postId", verifyToken, addComment);

router.get("/:postId", verifyToken, getCommentsByPost);

router.delete("/:id", verifyToken, deleteComment);

export default router;
