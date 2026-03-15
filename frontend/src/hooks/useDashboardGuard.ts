import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/lib/useAuth";

export function useDashboardGuard() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, isLoading, navigate]);

  return {
    isAllowed: isAuthenticated,
    showVerification: false,
    email: user?.email ?? null,
  };
}
