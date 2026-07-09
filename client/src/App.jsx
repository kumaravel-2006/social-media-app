import { Route, Routes, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Feed from "./pages/Feed";
import Messages from "./pages/Messages";
import ChatBox from "./pages/ChatBox";
import Connections from "./pages/Connections";
import Discover from "./pages/Discover";
import Profile from "./pages/Profile";
import CreatePost from "./pages/CreatePost";
import { useAuth } from "./context/AuthContext";
import Layout from "./pages/Layout";
import Loading from "./components/Loading";

const App = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      
      <Route path="/" element={user ? <Layout /> : <Navigate to="/login" replace />}>
        <Route index element={<Feed />} />
        <Route path="feed" element={<Feed />} />
        <Route path="messages" element={<Messages />} />
        <Route path="messages/:UserId" element={<ChatBox />} />
        <Route path="connections" element={<Connections />} />
        <Route path="discover" element={<Discover />} />
        <Route path="profile" element={<Profile />} />
        <Route path="profile/:profileId" element={<Profile />} />
        <Route path="create-post" element={<CreatePost />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
