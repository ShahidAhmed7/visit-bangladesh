import { createContext, useContext, useEffect, useState } from "react";
import api from "../utils/apiClient.js";

const AuthContext = createContext(null);

const normalizeUser = (data) => {
  if (!data) return null;
  const id = data.id || data._id;
  return { ...data, id };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get("/api/auth/me");
        setUser(normalizeUser(res.data));
      } catch (err) {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, [token]);

  const handleAuthSuccess = (payload) => {
    const nextToken = payload?.token;
    const nextUser = normalizeUser(payload?.user);
    if (nextToken) {
      localStorage.setItem("token", nextToken);
      setToken(nextToken);
    }
    if (nextUser) setUser(nextUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, setUser, handleAuthSuccess, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
