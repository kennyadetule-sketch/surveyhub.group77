import { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("surveyhub-token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        setUser(await authService.me());
      } catch {
        localStorage.removeItem("surveyhub-token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    localStorage.setItem("surveyhub-token", data.token);
    setUser(data.user);
    return data;
  };

  const register = async (credentials) => {
    const data = await authService.register(credentials);
    localStorage.setItem("surveyhub-token", data.token);
    setUser(data.user);
    return data;
  };

  const updateProfile = async (payload) => {
    const data = await authService.updateProfile(payload);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("surveyhub-token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, currentUser: user, loading, login, register, updateProfile, logout, isAuthenticated: Boolean(user) }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
