import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    desc: {
        type: String,
        maxlength: [500, "Description cannot exceed 500 characters"],
        trim: true
    },
    img: {
        type: String,
        default: ""
    },
    likes: {
        type: Array,
        default: []
    }
}, {
    timestamps: true
});

postSchema.index({ userId: 1, createdAt: -1 });


const Post = mongoose.model("Post", postSchema);

export default Post;
