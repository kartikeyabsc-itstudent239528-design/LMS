import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { User } from "@/types";
import { api } from "@/services/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const storedToken = localStorage.getItem('lms_token');
      const storedUser = localStorage.getItem('lms_user');
      if (!storedToken || !storedUser) {
        setIsLoading(false);
        return;
      }

      try {
        api.setToken(storedToken);
        const result = await api.getMe();
        setUser(result.user);
        setToken(storedToken);
      } catch (error) {
        localStorage.removeItem('lms_token');
        localStorage.removeItem('lms_user');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const loginFn = useCallback(async (email: string, password: string) => {
    const result = await api.login({ email, password });
    setUser(result.user);
    setToken(result.token);
    localStorage.setItem('lms_token', result.token);
    localStorage.setItem('lms_user', JSON.stringify(result.user));
  }, []);

  const signupFn = useCallback(async (name: string, email: string, password: string) => {
    const result = await api.signup({ name, email, password });
    setUser(result.user);
    setToken(result.token);
    localStorage.setItem('lms_token', result.token);
    localStorage.setItem('lms_user', JSON.stringify(result.user));
  }, []);

  const logoutFn = useCallback(() => {
    localStorage.removeItem('lms_token');
    localStorage.removeItem('lms_user');
    setUser(null);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, isLoading, login: loginFn, signup: signupFn, logout: logoutFn }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
