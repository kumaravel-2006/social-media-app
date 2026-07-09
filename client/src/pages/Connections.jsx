import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, UserMinus, UserPlus, UserCheck } from "lucide-react";
import { api } from "../utils/api";
import { assets } from "../assets/assets";
import Loading from "../components/Loading";

const Connections = () => {
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("following"); // 'following' or 'followers'
  const navigate = useNavigate();

  const fetchConnections = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await api.users.getConnections();
      setFollowers(data.followers || []);
      setFollowing(data.following || []);
    } catch (err) {
      setError(err.message || "Failed to fetch connections network.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const handleUnfollow = async (userId) => {
    // Optimistic UI updates
    setFollowing((prev) => prev.filter((u) => u._id !== userId));

    try {
      await api.users.toggleFollow(userId);
    } catch (err) {
      console.error("Failed to unfollow user:", err);
      // Revert if API fails
      fetchConnections();
    }
  };

  const handleFollowBack = async (user) => {
    // Optimistic UI: Add user to following list
    setFollowing((prev) => [...prev, user]);

    try {
      await api.users.toggleFollow(user._id);
    } catch (err) {
      console.error("Failed to follow user back:", err);
      // Revert if API fails
      fetchConnections();
    }
  };

  if (loading) return <Loading />;

  // Utility to check if you follow back a follower
  const isFollowingBack = (userId) => {
    return following.some((u) => u._id === userId);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 max-sm:pb-24">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
            <Users className="size-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">Your Developer Network</h1>
            <p className="text-xs text-gray-500 font-medium">Keep track of your followers and developer circles</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 border border-red-100 px-6 py-4 rounded-2xl mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Tabs list */}
      <div className="flex border-b border-gray-150 mb-6 gap-6">
        <button
          onClick={() => setActiveTab("following")}
          className={`pb-3 font-bold text-sm transition-all relative cursor-pointer ${
            activeTab === "following" ? "text-indigo-600 font-extrabold" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Following ({following.length})
          {activeTab === "following" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab("followers")}
          className={`pb-3 font-bold text-sm transition-all relative cursor-pointer ${
            activeTab === "followers" ? "text-indigo-600 font-extrabold" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Followers ({followers.length})
          {activeTab === "followers" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"></div>
          )}
        </button>
      </div>

      {/* Render user list */}
      {activeTab === "following" ? (
        following.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center text-gray-400 text-sm">
            You aren't following anyone yet. Head over to the Discover tab to find developers!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {following.map((u) => (
              <div
                key={u._id}
                className="bg-white border border-gray-100 rounded-3xl p-5 flex gap-4 shadow-sm items-center hover:shadow-md transition-all duration-300 animate-fade-in"
              >
                <img
                  src={u.profilePicture || assets.sample_profile}
                  alt={u.username}
                  onClick={() => navigate(`/profile/${u.username}`)}
                  className="w-12 h-12 rounded-full object-cover cursor-pointer hover:opacity-95 ring-2 ring-gray-50"
                />
                <div className="flex-1 min-w-0">
                  <h4
                    onClick={() => navigate(`/profile/${u.username}`)}
                    className="font-bold text-gray-900 text-sm cursor-pointer hover:text-indigo-600 truncate"
                  >
                    @{u.username}
                  </h4>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{u.bio || "No bio added yet."}</p>
                </div>
                <button
                  onClick={() => handleUnfollow(u._id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer border border-gray-100"
                  title="Unfollow"
                >
                  <UserMinus className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )
      ) : followers.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center text-gray-400 text-sm">
          No followers yet. Share updates on the Feed to build your audience!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {followers.map((u) => {
            const hasBack = isFollowingBack(u._id);
            return (
              <div
                key={u._id}
                className="bg-white border border-gray-100 rounded-3xl p-5 flex gap-4 shadow-sm items-center hover:shadow-md transition-all duration-300 animate-fade-in"
              >
                <img
                  src={u.profilePicture || assets.sample_profile}
                  alt={u.username}
                  onClick={() => navigate(`/profile/${u.username}`)}
                  className="w-12 h-12 rounded-full object-cover cursor-pointer hover:opacity-95 ring-2 ring-gray-50"
                />
                <div className="flex-1 min-w-0">
                  <h4
                    onClick={() => navigate(`/profile/${u.username}`)}
                    className="font-bold text-gray-900 text-sm cursor-pointer hover:text-indigo-600 truncate"
                  >
                    @{u.username}
                  </h4>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{u.bio || "No bio added yet."}</p>
                </div>
                {hasBack ? (
                  <span className="flex items-center gap-1 text-xs text-gray-400 font-bold bg-gray-50 border border-gray-150 px-3 py-1.5 rounded-xl">
                    <UserCheck className="size-3.5 text-gray-400" /> Friends
                  </span>
                ) : (
                  <button
                    onClick={() => handleFollowBack(u)}
                    className="flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold text-xs px-3.5 py-1.5 rounded-xl transition-all cursor-pointer border border-indigo-100"
                  >
                    <UserPlus className="size-3.5" /> Follow Back
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Connections;
