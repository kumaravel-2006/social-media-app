import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

export const startConversation = async (req, res) => {
    try {
        const { receiverId } = req.body;
        const senderId = req.user.id;

        let conversation = await Conversation.findOne({
            members: { $all: [senderId, receiverId] }
        });

        if (!conversation) {
            conversation = new Conversation({
                members: [senderId, receiverId]
            });
            await conversation.save();
        }

        res.status(200).json(conversation);
    } catch (error) {
        res.status(500).json({ message: "Server error: " + error.message });
    }
};

export const getConversations = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const conversations = await Conversation.find({
            members: { $in: [currentUserId] }
        }).populate("members", "username profilePicture bio");

        res.status(200).json(conversations);
    } catch (error) {
        res.status(500).json({ message: "Server error: " + error.message });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { conversationId, text } = req.body;
        const senderId = req.user.id;

        const newMessage = new Message({
            conversationId,
            senderId,
            text
        });

        const savedMessage = await newMessage.save();
        res.status(201).json(savedMessage);
    } catch (error) {
        res.status(500).json({ message: "Server error: " + error.message });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const messages = await Message.find({ conversationId }).sort({ createdAt: 1 }); // Sort oldest first so it reads top-to-bottom

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: "Server error: " + error.message });
    }
};