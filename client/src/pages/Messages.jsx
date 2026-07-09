import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Plus, ArrowRight, MessageCircle } from "lucide-react";
import { api } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { assets } from "../assets/assets";
import Loading from "../components/Loading";

const Messages = () => {
  const { user: currentUser } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showStartNew, setShowStartNew] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Fetch active conversations
      const convs = await api.chats.getConversations();
      setConversations(convs || []);

      // Fetch user's connections (following) to support starting new conversations
      const connData = await api.users.getConnections();
      setConnections(connData.following || []);
    } catch (err) {
      setError(err.message || "Failed to load chats data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStartChat = async (receiverId) => {
    try {
      // API call to ensure conversation is created
      await api.chats.startConversation(receiverId);
      // Navigate to chatbox passing receiverId (mapped to route path messages/:UserId)
      navigate(`/messages/${receiverId}`);
    } catch (err) {
      alert(err.message || "Could not start conversation.");
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 max-sm:pb-24">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
            <MessageSquare className="size-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">Direct Messages</h1>
            <p className="text-xs text-gray-500 font-medium">Chat in real-time with your followed connections</p>
          </div>
        </div>
        <button
          onClick={() => setShowStartNew(!showStartNew)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer self-start md:self-auto"
        >
          <Plus className="size-4" /> Start New Chat
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 border border-red-100 px-6 py-4 rounded-2xl mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Start New Chat Grid overlay list */}
      {showStartNew && (
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-3xl p-6 mb-8 animate-fade-in">
          <h3 className="text-sm font-extrabold text-indigo-900 mb-4">Select a Connection to Chat With</h3>
          {connections.length === 0 ? (
            <p className="text-xs text-indigo-600 italic">
              You aren't following anyone yet. You can only direct-message users that you follow! Go to "Discover" to grow your circle.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {connections.map((c) => (
                <div
                  key={c._id}
                  onClick={() => handleStartChat(c._id)}
                  className="bg-white hover:bg-indigo-50/20 border border-gray-100 rounded-2xl p-4 flex items-center gap-3 cursor-pointer transition-all shadow-sm group hover:scale-[1.01]"
                >
                  <img
                    src={c.profilePicture || assets.sample_profile}
                    alt={c.username}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-50"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-800 text-sm group-hover:text-indigo-600">@{c.username}</h4>
                    <p className="text-[10px] text-gray-400 truncate">{c.bio || "Active developer"}</p>
                  </div>
                  <ArrowRight className="size-4 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Conversations Thread List */}
      <h3 className="text-sm font-extrabold text-gray-900 mb-4">Active Threads</h3>
      {conversations.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-150 p-12 text-center flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
            <MessageCircle className="size-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">No Active Conversations</h3>
            <p className="text-gray-500 text-sm mt-1 max-w-sm">
              Start a new conversation thread with one of your connections above to kick off developer collaborations.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {conversations.map((conv) => {
            // Find the other member in the conversation members array
            const otherMember = conv.members.find((m) => m._id !== currentUser.id) || {};

            return (
              <div
                key={conv._id}
                onClick={() => handleStartChat(otherMember._id)}
                className="bg-white hover:bg-gray-50/50 border border-gray-100 rounded-3xl p-5 flex items-center gap-4 shadow-sm cursor-pointer transition-all hover:shadow-md hover:scale-[1.005]"
              >
                <img
                  src={otherMember.profilePicture || assets.sample_profile}
                  alt={otherMember.username}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-50"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 text-sm">@{otherMember.username}</h4>
                  <p className="text-xs text-gray-400 mt-1 truncate">
                    {otherMember.bio || "Tap here to chat and collaborate."}
                  </p>
                </div>
                <div className="text-[10px] text-gray-400 font-semibold self-start mt-1">
                  Active
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Messages;
