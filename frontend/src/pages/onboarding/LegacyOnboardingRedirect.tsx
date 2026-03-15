import { Navigate } from "react-router-dom";

/** Redirects to the legacy signup flow (email/password). */
export function LegacyOnboardingRedirect() {
  return <Navigate to="/signup" replace />;
}
