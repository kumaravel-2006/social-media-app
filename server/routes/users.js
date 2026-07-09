import express from "express";
import { followToggle, getUserProfile, getDiscoverUsers, updateProfile, getUserConnections } from "../controllers/userController.js";
import verifyToken from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/discover", verifyToken, getDiscoverUsers);

router.put("/update", verifyToken, updateProfile);

router.get("/profile/:username", verifyToken, getUserProfile);

router.put("/:id/follow", verifyToken, followToggle);

router.get("/connections", verifyToken, getUserConnections);

export default router;
