import User from "../models/User.js";

export const followToggle = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    if (currentUserId === targetUserId) {
      return res
        .status(400)
        .json({ message: "You cannot follow or unfollow yourself!" });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: "User not found!" });
    }

    if (!currentUser.following.includes(targetUserId)) {
      await currentUser.updateOne({ $push: { following: targetUserId } });
      await targetUser.updateOne({ $push: { followers: currentUserId } });

      return res
        .status(200)
        .json({ message: `Successfully followed ${targetUser.username}! 🎉` });
    } else {
      await currentUser.updateOne({ $pull: { following: targetUserId } });
      await targetUser.updateOne({ $pull: { followers: currentUserId } });

      return res
        .status(200)
        .json({
          message: `Successfully unfollowed ${targetUser.username}. 💔`,
        });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error occurred: " + error.message });
  }
};
