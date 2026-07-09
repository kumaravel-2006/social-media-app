import User from "../models/User.js";

export const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { bio, profilePicture, coverPicture } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      currentUserId,
      { $set: { bio, profilePicture, coverPicture } },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found!" });
    }

    res.status(200).json({
      message: "Profile updated successfully! ✨",
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

export const getDiscoverUsers = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return res.status(404).json({ message: "User profile not found!" });
    }

    const users = await User.find({
      _id: { $nin: [...currentUser.following, currentUserId] }
    })
      .select("username profilePicture bio")
      .limit(10);

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

export const followToggle = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const targetUserId = req.params.id;

    if (currentUserId === targetUserId) {
      return res.status(400).json({ message: "You cannot follow yourself!" });
    }

    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return res.status(404).json({ message: "Current user profile not found!" });
    }
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({ message: "Target user not found!" });
    }

    const isAlreadyFollowing = currentUser.following.some(
      (id) => id.toString() === targetUserId
    );

    if (!isAlreadyFollowing) {
      await currentUser.updateOne({ $push: { following: targetUserId } });
      await targetUser.updateOne({ $push: { followers: currentUserId } });
      res.status(200).json({ message: "Successfully followed user! 🤝" });
    }
    else {
      await currentUser.updateOne({ $pull: { following: targetUserId } });
      await targetUser.updateOne({ $pull: { followers: currentUserId } });
      res.status(200).json({ message: "Successfully unfollowed user! 👋" });
    }

  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

export const getUserConnections = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const user = await User.findById(currentUserId)
      .populate("followers", "username profilePicture bio")
      .populate("following", "username profilePicture bio");

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    res.status(200).json({
      followers: user.followers,
      following: user.following
    });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};
