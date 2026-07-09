import Comment from "../models/Comment.js";
import Post from "../models/Post.js";

export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.postId;
    const userId = req.user.id;

    if (!text) {
      return res.status(400).json({ message: "Comment text cannot be empty!" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found!" });
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
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const post = await Post.findById(comment.postId);
    if (comment.userId.toString() !== req.user.id && post?.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    await comment.deleteOne();
    res.status(200).json({ message: "Comment deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
