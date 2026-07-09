import { useState, useEffect } from "react";
import { Heart, MessageSquare, Send, Calendar, Sparkles } from "lucide-react";
import { api } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { assets } from "../assets/assets";
import Loading from "../components/Loading";
import { useNavigate } from "react-router-dom";

const Feed = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Track comments per post
  // format: { [postId]: { comments: [], loading: false, open: false, text: "" } }
  const [commentSection, setCommentSection] = useState({});

  const fetchTimeline = async () => {
    try {
      const data = await api.posts.getTimeline();
      setPosts(data.posts || []);
    } catch (err) {
      setError(err.message || "Failed to load timeline posts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, []);

  const handleLike = async (postId) => {
    // Optimistic UI update
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post._id === postId) {
          const isLiked = post.likes.includes(user.id);
          const newLikes = isLiked
            ? post.likes.filter((id) => id !== user.id)
            : [...post.likes, user.id];
          return { ...post, likes: newLikes };
        }
        return post;
      })
    );

    try {
      await api.posts.like(postId);
    } catch (err) {
      console.error("Failed to toggle like:", err);
      // Revert state if api fails
      fetchTimeline();
    }
  };

  const toggleComments = async (postId) => {
    const isCurrentlyOpen = commentSection[postId]?.open;

    setCommentSection((prev) => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        open: !isCurrentlyOpen,
      },
    }));

    if (!isCurrentlyOpen && (!commentSection[postId]?.comments || commentSection[postId]?.comments.length === 0)) {
      setCommentSection((prev) => ({
        ...prev,
        [postId]: {
          ...prev[postId],
          loading: true,
          open: true,
        },
      }));

      try {
        const data = await api.comments.getByPost(postId);
        setCommentSection((prev) => ({
          ...prev,
          [postId]: {
            ...prev[postId],
            comments: data.comments || [],
            loading: false,
          },
        }));
      } catch (err) {
        console.error("Failed to load comments:", err);
        setCommentSection((prev) => ({
          ...prev,
          [postId]: {
            ...prev[postId],
            loading: false,
          },
        }));
      }
    }
  };

  const handleCommentTextChange = (postId, text) => {
    setCommentSection((prev) => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        text,
      },
    }));
  };

  const handleAddComment = async (e, postId) => {
    e.preventDefault();
    const text = commentSection[postId]?.text || "";
    if (!text.trim()) return;

    // Reset input
    handleCommentTextChange(postId, "");

    try {
      const response = await api.comments.create(postId, text);
      const newComment = {
        ...response.comment,
        userId: {
          _id: user.id,
          username: user.username,
          profilePicture: user.profilePicture || "",
        },
      };

      setCommentSection((prev) => ({
        ...prev,
        [postId]: {
          ...prev[postId],
          comments: [newComment, ...(prev[postId]?.comments || [])],
        },
      }));
    } catch (err) {
      console.error("Failed to post comment:", err);
      alert(err.message || "Failed to post comment.");
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 max-sm:pb-24">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-indigo-100/50 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2">
            Welcome back, {user?.username}! <Sparkles className="size-6 text-yellow-300 animate-pulse" />
          </h1>
          <p className="text-indigo-100 mt-1 text-sm md:text-base">
            See what your connections have been up to today.
          </p>
        </div>
        <button
          onClick={() => navigate("/create-post")}
          className="bg-white text-indigo-600 font-semibold px-5 py-2.5 rounded-2xl shadow hover:bg-indigo-50 active:scale-95 transition-all text-sm self-start md:self-auto cursor-pointer"
        >
          Create Post
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 border border-red-100 px-6 py-4 rounded-2xl mb-6 text-sm">
          {error}
        </div>
      )}

      {posts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-150 p-12 text-center flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
            <Calendar className="size-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Your Feed is Empty</h3>
            <p className="text-gray-500 text-sm mt-1 max-w-sm">
              Follow other developers or share your own posts to get the conversation started.
            </p>
          </div>
          <button
            onClick={() => navigate("/create-post")}
            className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-6 py-2.5 rounded-2xl shadow transition-all cursor-pointer"
          >
            Create Your First Post
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => {
            const hasLiked = post.likes.includes(user.id);
            const postUser = post.userId || {};
            const commentsState = commentSection[post._id] || { open: false, comments: [], loading: false, text: "" };

            return (
              <article key={post._id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
                {/* Author Header */}
                <div className="p-5 flex items-center gap-3">
                  <img
                    src={postUser.profilePicture || assets.sample_profile}
                    alt={postUser.username}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-50"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">
                      {postUser.username || "Anonymous"}
                    </h4>
                    <span className="text-xs text-gray-400 font-medium">
                      {new Date(post.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                {/* Description */}
                {post.desc && (
                  <div className="px-5 pb-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {post.desc}
                  </div>
                )}

                {/* Image Attachment */}
                {post.img && (
                  <div className="bg-gray-50 border-y border-gray-100 max-h-[450px] overflow-hidden flex items-center justify-center">
                    <img
                      src={post.img}
                      alt="Post attachment"
                      className="w-full h-full object-contain max-h-[450px]"
                    />
                  </div>
                )}

                {/* Engagement Bar */}
                <div className="px-5 py-3.5 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    {/* Like button */}
                    <button
                      onClick={() => handleLike(post._id)}
                      className={`flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer ${
                        hasLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"
                      }`}
                    >
                      <Heart className={`size-5 transition-transform active:scale-125 ${hasLiked ? "fill-red-500 text-red-500" : ""}`} />
                      <span>{post.likes.length}</span>
                    </button>

                    {/* Comments button */}
                    <button
                      onClick={() => toggleComments(post._id)}
                      className={`flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer ${
                        commentsState.open ? "text-indigo-600" : "text-gray-500 hover:text-indigo-600"
                      }`}
                    >
                      <MessageSquare className="size-5" />
                      <span>{commentsState.comments?.length || post.commentsCount || 0} Comments</span>
                    </button>
                  </div>
                </div>

                {/* Comments Expandable Section */}
                {commentsState.open && (
                  <div className="bg-gray-50/50 border-t border-gray-100 p-5 flex flex-col gap-4">
                    {/* Add Comment Form */}
                    <form onSubmit={(e) => handleAddComment(e, post._id)} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        value={commentsState.text || ""}
                        onChange={(e) => handleCommentTextChange(post._id, e.target.value)}
                        className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-800"
                      />
                      <button
                        type="submit"
                        disabled={!commentsState.text?.trim()}
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2.5 rounded-xl shadow transition-all cursor-pointer"
                      >
                        <Send className="size-4" />
                      </button>
                    </form>

                    {/* Comments List */}
                    {commentsState.loading ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="w-6 h-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
                      </div>
                    ) : commentsState.comments?.length === 0 ? (
                      <p className="text-xs text-gray-400 italic text-center py-2">No comments yet. Be the first to comment!</p>
                    ) : (
                      <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
                        {commentsState.comments.map((comment) => {
                          const commenter = comment.userId || {};
                          return (
                            <div key={comment._id} className="flex items-start gap-2.5 text-sm">
                              <img
                                src={commenter.profilePicture || assets.sample_profile}
                                alt={commenter.username}
                                className="w-8 h-8 rounded-full object-cover ring-1 ring-gray-100 mt-0.5"
                              />
                              <div className="bg-white p-3 rounded-2xl border border-gray-150 flex-1">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-bold text-gray-800 text-xs">
                                    {commenter.username || "Anonymous"}
                                  </span>
                                  <span className="text-[10px] text-gray-400">
                                    {new Date(comment.createdAt).toLocaleDateString(undefined, {
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                                <p className="text-gray-600 text-xs leading-relaxed whitespace-pre-wrap">
                                  {comment.text}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Feed;
