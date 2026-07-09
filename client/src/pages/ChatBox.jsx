import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { api } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { assets } from "../assets/assets";
import { ArrowLeft, Send, MessageCircle } from "lucide-react";
import Loading from "../components/Loading";

const ChatBox = () => {
  const { UserId } = useParams(); // The ID of the user we are chatting with
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [chatUser, setChatUser] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const socket = useRef();
  const scrollRef = useRef();

  // 1. Fetch Chat Partner's Profile Info and Conversation History
  useEffect(() => {
    const initChat = async () => {
      try {
        setLoading(true);
        setError("");

        // A. Start/Retrieve conversation with user (returns conversation containing _id and members)
        const conv = await api.chats.startConversation(UserId);
        setConversation(conv);

        // B. Find other user's profile metadata. 
        // We look up the members array in conversation, or fetch their profile directly.
        // Fetching directly by finding profile with the username/ID is safest.
        // Let's resolve the user object by fetching their profile details.
        // Since getProfile expects username, we can fetch all conversations first or we can get connection details.
        // A direct lookup is safest since members are returned in the conversation details.
        // But the conversation doesn't populate members in startConversation.
        // So let's fetch conversations to find the populated member or we can get conversations list.
        // Wait, startConversation in chatController.js:
        // returns `res.status(200).json(conversation);` which is the raw MongoDB doc, members are just ObjectIds.
        // So we can fetch the lists of conversations which ARE populated, 
        // or we can find other member in connection.
        // Let's just find the conversation in the populated getConversations call!
        const allConversations = await api.chats.getConversations();
        const matchedConv = allConversations.find(c => c._id === conv._id);
        if (matchedConv) {
          const other = matchedConv.members.find(m => m._id !== currentUser.id);
          setChatUser(other);
        } else {
          // Fallback: If not found in conversations, fetch basic details
          setChatUser({ username: "Developer Connection" });
        }

        // C. Fetch all messages in the conversation
        const msgList = await api.chats.getMessages(conv._id);
        setMessages(msgList || []);
      } catch (err) {
        setError(err.message || "Failed to initialize conversation.");
      } finally {
        setLoading(false);
      }
    };

    if (UserId && currentUser?.id) {
      initChat();
    }
  }, [UserId, currentUser?.id]);

  // 2. Establish Socket Connection
  useEffect(() => {
    // Establish connection to backend server running on port 5000
    socket.current = io("http://localhost:5000");

    // Register active user in chat engine
    socket.current.emit("addUser", currentUser.id);

    // Listen for incoming messages
    socket.current.on("getMessage", (data) => {
      // Append if the message belongs to the current open chat window
      if (data.senderId === UserId) {
        setMessages((prev) => [
          ...prev,
          {
            senderId: data.senderId,
            text: data.text,
            createdAt: new Date().toISOString(),
          },
        ]);
      }
    });

    return () => {
      // Disconnect socket connection on unmount
      socket.current.disconnect();
    };
  }, [UserId, currentUser?.id]);

  // 3. Scroll to Bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 4. Send Message Function
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessageText.trim() || !conversation) return;

    const messageText = newMessageText.trim();
    setNewMessageText("");

    // Optimistic local state update
    const optimisticMessage = {
      _id: Date.now().toString(),
      conversationId: conversation._id,
      senderId: currentUser.id,
      text: messageText,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    // Send through WebSocket to target receiver
    socket.current.emit("sendMessage", {
      senderId: currentUser.id,
      receiverId: UserId,
      text: messageText,
    });

    try {
      // Save permanently to database
      await api.chats.sendMessage(conversation._id, messageText);
    } catch (err) {
      console.error("Failed to store message in DB:", err);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 max-sm:pb-24 h-[calc(100vh-100px)] flex flex-col">
      {/* Header back bar */}
      <div className="bg-white border border-gray-100 rounded-3xl p-4 flex items-center justify-between shadow-sm mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/messages")}
            className="p-2 hover:bg-gray-50 rounded-xl text-gray-500 hover:text-indigo-600 transition-all cursor-pointer"
          >
            <ArrowLeft className="size-5" />
          </button>
          
          <img
            src={chatUser?.profilePicture || assets.sample_profile}
            alt={chatUser?.username}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-50"
          />
          <div>
            <h4 className="font-bold text-gray-900 text-sm">
              @{chatUser?.username || "Developer Connection"}
            </h4>
            <span className="text-[10px] text-green-500 font-semibold flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span> Online
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 border border-red-100 px-6 py-4 rounded-2xl mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Messages Pane */}
      <div className="flex-1 bg-white border border-gray-100 rounded-3xl p-5 overflow-y-auto flex flex-col gap-4 shadow-sm mb-4">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-center gap-2">
            <MessageCircle className="size-8 text-gray-300" />
            <p className="text-xs italic">No messages yet. Send a message to start the collaboration!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUser.id;
            return (
              <div
                key={msg._id}
                className={`flex flex-col max-w-[70%] ${
                  isMe ? "self-end items-end" : "self-start items-start"
                }`}
              >
                <div
                  className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                    isMe
                      ? "bg-indigo-600 text-white rounded-br-none"
                      : "bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200"
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-gray-400 font-semibold mt-1 px-1.5">
                  {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            );
          })
        )}
        <div ref={scrollRef}></div>
      </div>

      {/* Input Message Form */}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          placeholder="Type a secure message..."
          value={newMessageText}
          onChange={(e) => setNewMessageText(e.target.value)}
          className="flex-1 px-5 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-800 shadow-sm"
        />
        <button
          type="submit"
          disabled={!newMessageText.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white p-3.5 rounded-2xl shadow-md cursor-pointer transition-all hover:scale-105 active:scale-95"
        >
          <Send className="size-5" />
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
