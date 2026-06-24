"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { ApiResponse, AuthResponse, LoginRequest, RegisterRequest, UserResponse } from "@/lib/types";

interface AuthContextValue {
  user: UserResponse | null;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function getCachedUser(): UserResponse | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setCachedUser(user: UserResponse | null) {
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  } else {
    localStorage.removeItem("user");
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(getCachedUser);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setCachedUser(null);
      setUser(null);
      setIsLoading(false);
      return;
    }

    api
      .get<ApiResponse<UserResponse>>("/api/profile")
      .then((res) => {
        if (res.status && res.data) {
          setUser(res.data);
          setCachedUser(res.data);
        } else {
          localStorage.removeItem("token");
          setCachedUser(null);
          setUser(null);
        }
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          localStorage.removeItem("token");
          setCachedUser(null);
          setUser(null);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    const res = await api.post<ApiResponse<AuthResponse>>("/api/auth/login", data);
    if (!res.status || !res.data) {
      throw new ApiError(400, res.message);
    }
    localStorage.setItem("token", res.data.token);
    setCachedUser(res.data.user);
    setUser(res.data.user);
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    const res = await api.post<ApiResponse<AuthResponse>>("/api/auth/register", data);
    if (!res.status) {
      throw new ApiError(400, res.message);
    }
    if (res.data) {
      localStorage.setItem("token", res.data.token);
      setCachedUser(res.data.user);
      setUser(res.data.user);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setCachedUser(null);
    setUser(null);
    api.post("/api/auth/logout").catch(() => {});
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
