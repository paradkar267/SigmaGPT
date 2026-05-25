import { useCallback, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext.js";

const API = "http://localhost:8000/api/auth";

const apiFetch = (path, options = {}) => {
  const { headers, ...rest } = options;

  return fetch(`${API}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...headers },
    ...rest,
  });
};

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  useEffect(() => {
    apiFetch("/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((userData) => {
        if (userData) setUser(userData);
      })
      .catch(() => {})
      .finally(() => setAuthLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await apiFetch("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");
    setUser(data.user);
    setShowAuthModal(false);
    return data;
  }, []);

  const signup = useCallback(async (name, email, password) => {
    const res = await apiFetch("/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Signup failed");
    setUser(data.user);
    setShowAuthModal(false);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiFetch("/logout", { method: "POST" });
    } finally {
      setUser(null);
      setShowAuthModal(false);
    }
  }, []);

  const openAuthModal = useCallback((tab = "login") => {
    setActiveTab(tab);
    setShowAuthModal(true);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        authLoading,
        login,
        signup,
        logout,
        showAuthModal,
        setShowAuthModal,
        openAuthModal,
        activeTab,
        setActiveTab,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
