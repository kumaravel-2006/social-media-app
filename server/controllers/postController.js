import Post from "../models/Post.js";
import User from "../models/User.js";

export const createPost = async (req, res) => {
  try {
    const { desc, img } = req.body;

    const userId = req.user.id;

    if (!desc && !img) {
      return res.status(400).json({ message: "Post content cannot be empty!" });
    }

    const newPost = new Post({
      userId,
      desc,
      img,
    });

    const savedPost = await newPost.save();

    res.status(201).json({
      message: "Post created successfully!",
      post: savedPost,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error occurred: " + error.message });
  }
};

export const likePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found!" });
    }

    if (!post.likes.includes(userId)) {
      await post.updateOne({ $push: { likes: userId } });
      return res.status(200).json({ message: "The post has been liked! ❤️" });
    } else {
      await post.updateOne({ $pull: { likes: userId } });
      return res.status(200).json({ message: "The post has been unliked. 💔" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error occurred: " + error.message });
  }
};

export const getTimeline = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return res.status(404).json({ message: "User profile not found." });
    }

    const targetAccounts = [...currentUser.following, currentUserId];

    const timelinePosts = await Post.find({ userId: { $in: targetAccounts } })
      .sort({ createdAt: -1 })
      .populate("userId", "username profilePicture");

    res.status(200).json({
      message: "Personalized home feed loaded! 🏠",
      count: timelinePosts.length,
      posts: timelinePosts,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error occurred: " + error.message });
  }
};
