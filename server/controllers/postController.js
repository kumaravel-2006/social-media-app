import Post from "../models/Post.js";
import User from "../models/User.js";
import Comment from "../models/Comment.js";

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

// UPDATE POST
export const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Ensure user owns the post
    if (post.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE POST
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    await Comment.deleteMany({ postId: req.params.id });
    await post.deleteOne();
    res.status(200).json({ message: "Post has been deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
export const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    const posts = await Post.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .populate("userId", "username profilePicture");

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};