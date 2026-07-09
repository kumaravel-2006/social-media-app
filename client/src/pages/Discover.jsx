import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Sparkles, UserPlus, UserCheck } from "lucide-react";
import { api } from "../utils/api";
import { assets } from "../assets/assets";
import Loading from "../components/Loading";

const Discover = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await api.users.getDiscover();
      setUsers(data || []);
    } catch (err) {
      setError(err.message || "Failed to fetch developer recommendations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleFollow = async (userId) => {
    // Optimistic state: set followed to show check, then animate out of suggestions
    setUsers((prev) =>
      prev.map((user) => (user._id === userId ? { ...user, followed: true } : user))
    );

    try {
      await api.users.toggleFollow(userId);
      // Wait a brief moment to let user see "Following" before fading out
      setTimeout(() => {
        setUsers((prev) => prev.filter((user) => user._id !== userId));
      }, 500);
    } catch (err) {
      console.error("Failed to follow user:", err);
      // Revert if API fails
      setUsers((prev) =>
        prev.map((user) => (user._id === userId ? { ...user, followed: false } : user))
      );
    }
  };

  if (loading) return <Loading />;

  // Filter recommendations based on search input
  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 max-sm:pb-24">
      {/* Banner info */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-indigo-100/50 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2">
            Discover Connections <Sparkles className="size-6 text-yellow-300 animate-pulse" />
          </h1>
          <p className="text-indigo-100 mt-1 text-sm md:text-base">
            Grow your network of developers, designers, and creators in the community.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 border border-red-100 px-6 py-4 rounded-2xl mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Search Filter Bar */}
      {users.length > 0 && (
        <div className="mb-6 relative flex items-center">
          <input
            type="text"
            placeholder="Search connections by username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-800 shadow-sm pl-12"
          />
          <Search className="size-5 text-gray-400 absolute left-4 pointer-events-none" />
        </div>
      )}

      {/* Recommendations Display */}
      {filteredUsers.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-150 p-12 text-center flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
            <Search className="size-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">No Connections Found</h3>
            <p className="text-gray-500 text-sm mt-1 max-w-sm">
              {searchQuery 
                ? "No matching users found for your query. Try searching another username." 
                : "You're connected with everyone we can recommend right now! Check back later."}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredUsers.map((recUser) => (
            <div
              key={recUser._id}
              className="bg-white border border-gray-100 rounded-3xl p-5 flex gap-4 shadow-sm items-start hover:shadow-md transition-all duration-300"
            >
              {/* Profile Pic Link */}
              <img
                src={recUser.profilePicture || assets.sample_profile}
                alt={recUser.username}
                onClick={() => navigate(`/profile/${recUser.username}`)}
                className="w-14 h-14 rounded-full object-cover ring-2 ring-gray-50 cursor-pointer hover:opacity-95"
              />

              {/* Card Meta details */}
              <div className="flex-1 min-w-0">
                <h4
                  onClick={() => navigate(`/profile/${recUser.username}`)}
                  className="font-bold text-gray-900 text-sm cursor-pointer hover:text-indigo-600 transition-colors truncate"
                >
                  @{recUser.username}
                </h4>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                  {recUser.bio || "No professional summary added yet."}
                </p>
                
                <button
                  onClick={() => handleFollow(recUser._id)}
                  disabled={recUser.followed}
                  className={`mt-4 flex items-center gap-1.5 font-bold text-[11px] px-4 py-2 rounded-xl transition-all cursor-pointer ${
                    recUser.followed
                      ? "bg-gray-50 text-gray-400 border border-gray-150"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                  }`}
                >
                  {recUser.followed ? (
                    <>
                      <UserCheck className="size-3.5" /> Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="size-3.5" /> Follow
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Discover;
