import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { api, TOKEN_KEY } from "../lib/api";
import type { User } from "../types";

type AuthContextType = {
  user: User | null;
  isLoggedIn: boolean;
  isAuthor: boolean;
  isAdmin: boolean;
  loading: boolean; // true selama token lama sedang dicek ke server
  username: string;
  bio: string;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (username: string, bio: string) => Promise<void>;
  registerAsAuthor: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem(TOKEN_KEY)));

  // Buka website → kalau ada token tersimpan, cek ke server siapa pemiliknya
  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    api
      .get<{ user: User }>("/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  // Dipicu otomatis kalau server menolak token (kedaluwarsa / di-ban)
  useEffect(() => {
    const onForcedLogout = () => setUser(null);
    window.addEventListener("evertale:logout", onForcedLogout);
    return () => window.removeEventListener("evertale:logout", onForcedLogout);
  }, []);

  const saveSession = (token: string, nextUser: User) => {
    localStorage.setItem(TOKEN_KEY, token);
    setUser(nextUser);
  };

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<{ token: string; user: User }>("/auth/login", { email, password });
    saveSession(res.data.token, res.data.user);
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const res = await api.post<{ token: string; user: User }>("/auth/register", { email, password });
    saveSession(res.data.token, res.data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (username: string, bio: string) => {
    const res = await api.patch<{ user: User }>("/users/me", { username, bio });
    setUser(res.data.user);
  }, []);

  const registerAsAuthor = useCallback(async () => {
    const res = await api.post<{ user: User }>("/users/me/become-author");
    setUser(res.data.user);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: user !== null,
        isAuthor: user?.is_author ?? false,
        isAdmin: user?.is_admin ?? false,
        loading,
        username: user?.username ?? "Pembaca",
        bio: user?.bio ?? "",
        login,
        register,
        logout,
        updateProfile,
        registerAsAuthor,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
