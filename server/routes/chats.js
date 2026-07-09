import express from "express";
import {
    startConversation,
    getConversations,
    sendMessage,
    getMessages
} from "../controllers/chatController.js";
import verifyToken from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/conversation", verifyToken, startConversation);
router.get("/conversations", verifyToken, getConversations);
router.post("/message", verifyToken, sendMessage);
router.get("/messages/:conversationId", verifyToken, getMessages);

export default router;