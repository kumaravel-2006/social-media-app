const BASE_URL = "http://localhost:5000/api";

const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

export const api = {
  auth: {
    login: (email, password) =>
      request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    register: (username, email, password) =>
      request("/auth/register", {
        method: "POST",
        body: JSON.stringify({ username, email, password }),
      }),
    getProfile: () => request("/protected-profile"),
  },
  posts: {
    getTimeline: () => request("/posts/timeline"),
    create: (desc, img) =>
      request("/posts", {
        method: "POST",
        body: JSON.stringify({ desc, img }),
      }),
    like: (postId) =>
      request(`/posts/${postId}/like`, {
        method: "PUT",
      }),
    getUserPosts: (username) => request(`/posts/profile/${username}`),
  },
  comments: {
    getByPost: (postId) => request(`/comments/${postId}`),
    create: (postId, text) =>
      request(`/comments/${postId}`, {
        method: "POST",
        body: JSON.stringify({ text }),
      }),
  },
  users: {
    toggleFollow: (userId) =>
      request(`/users/${userId}/follow`, {
        method: "PUT",
      }),
    getProfile: (username) => request(`/users/profile/${username}`),
    updateProfile: (data) =>
      request("/users/update", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    getDiscover: () => request("/users/discover"),
    getConnections: () => request("/users/connections"),
  },
  chats: {
    startConversation: (receiverId) =>
      request("/chats/conversation", {
        method: "POST",
        body: JSON.stringify({ receiverId }),
      }),
    getConversations: () => request("/chats/conversations"),
    sendMessage: (conversationId, text) =>
      request("/chats/message", {
        method: "POST",
        body: JSON.stringify({ conversationId, text }),
      }),
    getMessages: (conversationId) => request(`/chats/messages/${conversationId}`),
  },
};
