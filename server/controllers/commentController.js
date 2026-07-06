import Comment from "../models/Comment.js";

export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.postId;
    const userId = req.user.id;

    if (!text) {
      return res.status(400).json({ message: "Comment text cannot be empty!" });
    }

    const newComment = new Comment({
      postId,
      userId,
      text,
    });

    const savedComment = await newComment.save();

    res.status(201).json({
      message: "Comment posted successfully! 💬",
      comment: savedComment,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error occurred: " + error.message });
  }
};
export const getCommentsByPost = async (req, res) => {
  try {
    const postId = req.params.postId;

    const comments = await Comment.find({ postId })
      .sort({ createdAt: -1 })
      .populate("userId", "username profilePicture");

    res.status(200).json({
      message: "Comments retrieved successfully! 💬",
      count: comments.length,
      comments,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error occurred: " + error.message });
  }
};
