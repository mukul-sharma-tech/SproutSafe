import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/useAuth";

interface AuthGateProps {
  children: ReactNode;
}

// Wraps the landing page — if user is already logged in, redirect to dashboard.
// Does NOT block rendering while checking; shows content immediately.
export function AuthGate({ children }: AuthGateProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Always render children — no loading spinner that blocks the page
  return <>{children}</>;
}
