import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: [true, "Comment text cannot be empty"],
      maxlength: [300, "Comments cannot exceed 300 characters"],
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

commentSchema.index({ postId: 1, createdAt: -1 });

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
