import { useState, useEffect } from "react";
import apiClient from "@/api/client";

export interface AuthUser {
  email: string;
  name: string;
}

export function useAuth() {
  const token = localStorage.getItem("token");
  const [user, setUser] = useState<AuthUser | null>(null);
  // If no token, we're already done — no loading needed
  const [isLoading, setIsLoading] = useState(!!token);

  useEffect(() => {
    if (!token) return;
    apiClient
      .get("/api/auth/user")
      .then(({ data }) => setUser({ email: data.email, name: data.name }))
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/";
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
  };
}
