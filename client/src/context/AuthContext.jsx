import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../utils/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        try {
          // Verify token against protected endpoint
          await api.auth.getProfile();
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error("Token verification failed:", error);
          // Token expired or invalid, clear session
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.auth.login(email, password);
      const { token, user: userData } = response;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password) => {
    setLoading(true);
    try {
      const response = await api.auth.register(username, email, password);
      // Backend registration endpoint doesn't automatically return a JWT token,
      // it returns message and registered user details.
      // So the user can immediately log in.
      return response;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const updateUser = (userData) => {
    const currentUserData = JSON.parse(localStorage.getItem("user") || "{}");
    const updated = { ...currentUserData, ...userData };
    localStorage.setItem("user", JSON.stringify(updated));
    setUser(updated);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
