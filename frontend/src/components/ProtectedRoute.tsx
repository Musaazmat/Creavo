// ProtectedRoute — only lets a logged-in user see the page; otherwise sends
// them to /login. Shows a spinner while the session is being restored so a
// refresh doesn't bounce a logged-in user to the login page.
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { SessionRestoreSkeleton } from "./Skeletons";

export default function ProtectedRoute({
  children,
}: {
  children: ReactNode;
}) {
  const { user, loading } = useAuth();
  if (loading) return <SessionRestoreSkeleton />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}