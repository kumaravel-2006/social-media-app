import express from "express";
import { followToggle } from "../controllers/userController.js";
import verifyToken from "../middlewares/authMiddleware.js";

const router = express.Router();

router.put("/:id/follow", verifyToken, followToggle);

export default router;
