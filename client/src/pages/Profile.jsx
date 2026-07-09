import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";
import { assets } from "../assets/assets";
import { 
  Heart, 
  MessageSquare, 
  Edit3, 
  Calendar, 
  Camera, 
  X, 
  Send, 
  UserPlus, 
  UserCheck, 
  Sparkles,
  ArrowLeft
} from "lucide-react";
import Loading from "../components/Loading";

const Profile = () => {
  const { profileId } = useParams(); // This is the username from the URL route
  const navigate = useNavigate();
  const { user: currentUser, updateUser } = useAuth();

  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState("");
  const [editProfilePic, setEditProfilePic] = useState("");
  const [editCoverPic, setEditCoverPic] = useState("");
  const [updating, setUpdating] = useState(false);

  // Comments state matching Feed.jsx
  const [commentSection, setCommentSection] = useState({});

  const targetUsername = profileId || currentUser?.username;
  const isOwnProfile = targetUsername === currentUser?.username;

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const userData = await api.users.getProfile(targetUsername);
      setProfileUser(userData);
      
      // Initialize edit form values
      setEditBio(userData.bio || "");
      setEditProfilePic(userData.profilePicture || "");
      setEditCoverPic(userData.coverPicture || "");

      // Fetch posts for this user
      const userPosts = await api.posts.getUserPosts(targetUsername);
      setPosts(userPosts || []);
    } catch (err) {
      setError(err.message || "Failed to load user profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (targetUsername) {
      fetchProfileData();
    }
  }, [profileId]);

  const handleFollowToggle = async () => {
    if (!profileUser) return;
    
    const isFollowing = profileUser.followers.includes(currentUser.id);
    
    // Optimistic UI updates
    setProfileUser((prev) => {
      const updatedFollowers = isFollowing
        ? prev.followers.filter((id) => id !== currentUser.id)
        : [...prev.followers, currentUser.id];
      return { ...prev, followers: updatedFollowers };
    });

    try {
      await api.users.toggleFollow(profileUser._id);
    } catch (err) {
      console.error("Failed to toggle follow status:", err);
      // Revert if API fails
      fetchProfileData();
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const response = await api.users.updateProfile({
        bio: editBio,
        profilePicture: editProfilePic,
        coverPicture: editCoverPic,
      });

      setProfileUser(response.user);
      
      // Update global context so other parts of UI (e.g. sidebar) reflect changes
      updateUser({
        profilePicture: response.user.profilePicture,
        bio: response.user.bio,
      });

      setIsEditing(false);
    } catch (err) {
      alert(err.message || "Failed to update profile.");
    } finally {
      setUpdating(false);
    }
  };

  // Reused Feed Likes/Comments Logic
  const handleLike = async (postId) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post._id === postId) {
          const isLiked = post.likes.includes(currentUser.id);
          const newLikes = isLiked
            ? post.likes.filter((id) => id !== currentUser.id)
            : [...post.likes, currentUser.id];
          return { ...post, likes: newLikes };
        }
        return post;
      })
    );

    try {
      await api.posts.like(postId);
    } catch (err) {
      console.error("Failed to toggle like:", err);
      fetchProfileData();
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
          [postId]: { ...prev[postId], loading: false },
        }));
      }
    }
  };

  const handleCommentTextChange = (postId, text) => {
    setCommentSection((prev) => ({
      ...prev,
      [postId]: { ...prev[postId], text },
    }));
  };

  const handleAddComment = async (e, postId) => {
    e.preventDefault();
    const text = commentSection[postId]?.text || "";
    if (!text.trim()) return;

    handleCommentTextChange(postId, "");

    try {
      const response = await api.comments.create(postId, text);
      const newComment = {
        ...response.comment,
        userId: {
          _id: currentUser.id,
          username: currentUser.username,
          profilePicture: currentUser.profilePicture || "",
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

  if (error || !profileUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="bg-red-50 text-red-600 border border-red-100 p-6 rounded-2xl inline-block max-w-md">
          <p className="font-semibold">{error || "User Profile not found."}</p>
          <button 
            onClick={() => navigate("/")}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white text-xs px-4 py-2 rounded-xl"
          >
            Go back to Feed
          </button>
        </div>
      </div>
    );
  }

  const isFollowing = profileUser.followers.includes(currentUser.id);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 max-sm:pb-24">
      {/* Header Back Button */}
      {!isOwnProfile && (
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-indigo-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-4" /> Back
        </button>
      )}

      {/* Profile Card Container */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        {/* Cover Photo */}
        <div className="h-48 md:h-64 bg-slate-100 relative group overflow-hidden">
          <img
            src={profileUser.coverPicture || assets.sample_cover}
            className="w-full h-full object-cover"
            alt="Cover background"
          />
          {isOwnProfile && (
            <button
              onClick={() => setIsEditing(true)}
              className="absolute right-4 top-4 bg-black/40 hover:bg-black/60 text-white p-2.5 rounded-xl cursor-pointer transition-all backdrop-blur-sm"
              title="Change cover picture"
            >
              <Camera className="size-4" />
            </button>
          )}
        </div>

        {/* Profile Details Layer */}
        <div className="relative px-6 pb-6 pt-2">
          {/* Profile Picture Overlay */}
          <div className="absolute -top-16 left-6 ring-4 ring-white rounded-full bg-white overflow-hidden w-28 h-28 md:w-32 md:h-32 shadow-md">
            <img
              src={profileUser.profilePicture || assets.sample_profile}
              className="w-full h-full object-cover"
              alt={profileUser.username}
            />
          </div>

          {/* Action Row */}
          <div className="flex justify-end gap-3 h-14 items-center">
            {isOwnProfile ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm"
              >
                <Edit3 className="size-3.5" /> Edit Profile
              </button>
            ) : (
              <button
                onClick={handleFollowToggle}
                className={`flex items-center gap-2 font-semibold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm ${
                  isFollowing
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="size-3.5" /> Following
                  </>
                ) : (
                  <>
                    <UserPlus className="size-3.5" /> Follow Connection
                  </>
                )}
              </button>
            )}
          </div>

          {/* Identity & Bio */}
          <div className="mt-4">
            <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              @{profileUser.username}
              {isOwnProfile && <Sparkles className="size-4 text-indigo-500 animate-pulse" />}
            </h2>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              Joined {new Date(profileUser.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long" })}
            </p>

            {profileUser.bio ? (
              <p className="text-sm text-gray-600 mt-4 leading-relaxed whitespace-pre-wrap max-w-xl">
                {profileUser.bio}
              </p>
            ) : (
              <p className="text-xs text-gray-400 italic mt-4">
                No bio provided yet. Add dynamic project details, stack specializations, or links!
              </p>
            )}

            {/* Network Count Stats */}
            <div className="flex gap-6 mt-6 pt-5 border-t border-gray-150">
              <div className="text-sm">
                <span className="font-extrabold text-gray-900">{profileUser.following?.length || 0}</span>
                <span className="text-gray-500 ml-1.5 font-medium">Following</span>
              </div>
              <div className="text-sm">
                <span className="font-extrabold text-gray-900">{profileUser.followers?.length || 0}</span>
                <span className="text-gray-500 ml-1.5 font-medium">Followers</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User's Post Feed Title */}
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-base font-extrabold text-gray-900">
          {isOwnProfile ? "Your Shared Updates" : `Posts by @${profileUser.username}`}
        </h3>
        <span className="bg-indigo-50 text-indigo-600 font-bold px-3 py-1 rounded-full text-xs">
          {posts.length} posts
        </span>
      </div>

      {/* Feed Area */}
      {posts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center text-gray-400 text-sm">
          No updates shared yet.
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => {
            const hasLiked = post.likes.includes(currentUser.id);
            const commentsState = commentSection[post._id] || { open: false, comments: [], loading: false, text: "" };

            return (
              <article key={post._id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
                {/* Header info */}
                <div className="p-5 flex items-center gap-3">
                  <img
                    src={profileUser.profilePicture || assets.sample_profile}
                    alt={profileUser.username}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-50"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">@{profileUser.username}</h4>
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

                {/* Attachment */}
                {post.img && (
                  <div className="bg-gray-50 border-y border-gray-100 max-h-[400px] overflow-hidden flex items-center justify-center">
                    <img src={post.img} alt="Update illustration" className="w-full h-full object-contain max-h-[400px]" />
                  </div>
                )}

                {/* Engagement Bar */}
                <div className="px-5 py-3.5 border-t border-gray-50 flex items-center gap-6">
                  <button
                    onClick={() => handleLike(post._id)}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer ${
                      hasLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"
                    }`}
                  >
                    <Heart className={`size-5 transition-transform active:scale-125 ${hasLiked ? "fill-red-500 text-red-500" : ""}`} />
                    <span>{post.likes.length}</span>
                  </button>

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

                {/* Comment Section Expand */}
                {commentsState.open && (
                  <div className="bg-gray-50/50 border-t border-gray-100 p-5 flex flex-col gap-4">
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
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white p-2.5 rounded-xl shadow cursor-pointer"
                      >
                        <Send className="size-4" />
                      </button>
                    </form>

                    {commentsState.loading ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : commentsState.comments?.length === 0 ? (
                      <p className="text-xs text-gray-400 italic text-center py-2">No comments yet.</p>
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
                                  <span className="font-bold text-gray-800 text-xs">@{commenter.username}</span>
                                  <span className="text-[10px] text-gray-400">
                                    {new Date(comment.createdAt).toLocaleDateString(undefined, {
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                                <p className="text-gray-600 text-xs leading-relaxed whitespace-pre-wrap">{comment.text}</p>
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

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 z-30 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-scale-up">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-base">Edit Developer Profile</h3>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="p-6 flex flex-col gap-4">
              {/* Profile Bio */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-600 pl-1">Professional Bio</label>
                <textarea
                  rows={3}
                  maxLength={160}
                  placeholder="Tell connections about your projects, stack, and developer journey..."
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-800 resize-none"
                />
                <span className="text-[10px] text-gray-400 self-end pr-1">{editBio.length}/160 characters</span>
              </div>

              {/* Profile Pic URL */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-600 pl-1">Profile Picture URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={editProfilePic}
                  onChange={(e) => setEditProfilePic(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-800"
                />
              </div>

              {/* Cover Pic URL */}
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-xs font-bold text-gray-600 pl-1">Background Banner URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={editCoverPic}
                  onChange={(e) => setEditCoverPic(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-800"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-75 text-white font-semibold text-xs px-5 py-2.5 rounded-xl cursor-pointer shadow-md transition-all"
                >
                  {updating ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
