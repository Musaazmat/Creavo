import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { queryKeys } from "../queryKeys";
import type { AuthUser } from "../types";
import { getMe } from "../utils/api";

export type { AuthUser } from "../types";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  loginUser: (token: string, userData: AuthUser) => void;
  logoutUser: () => void;
  updateUser: (userData: AuthUser | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function isAuthUser(value: unknown): value is AuthUser {
  if (typeof value !== "object" || value === null) return false;
  const user = value as Record<string, unknown>;
  return (
    typeof user.id === "string" &&
    typeof user.name === "string" &&
    typeof user.email === "string" &&
    typeof user.credits === "number" &&
    typeof user.emailVerified === "boolean"
  );
}

// High-level provider that manages the global authentication state, session
// persistence, and the current user profile across the application.
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [cachedUser, setCachedUser] = useState<AuthUser | null>(() => {
    const value = localStorage.getItem("user");
    if (!value) return null;
    try {
      const parsed: unknown = JSON.parse(value);
      return isAuthUser(parsed) ? parsed : null;
    } catch {
      return null;
    }
  });
  const profileQuery = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: getMe,
    enabled: Boolean(token),
    staleTime: 0,
  });
  const user = profileQuery.data?.user ?? cachedUser;

  useEffect(() => {
    if (!profileQuery.data?.user) return;
    setCachedUser(profileQuery.data.user);
    localStorage.setItem("user", JSON.stringify(profileQuery.data.user));
  }, [profileQuery.data?.user]);

  useEffect(() => {
    if (!profileQuery.isError || !token) return;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setCachedUser(null);
    queryClient.removeQueries({ queryKey: queryKeys.auth.me });
  }, [profileQuery.isError, queryClient, token]);

  // Persists the JWT token + user profile to localStorage and updates state.
  const loginUser = (token: string, userData: AuthUser): void => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(token);
    setCachedUser(userData);
    queryClient.setQueryData(queryKeys.auth.me, { user: userData });
  };

  // Clears all credentials from localStorage and resets the global user state.
  const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setCachedUser(null);
    queryClient.removeQueries({ queryKey: queryKeys.auth.me });
  };

  // Updates the cached user (e.g. after a profile edit or a credit change) and
  // keeps localStorage in sync.
  const updateUser = (userData: AuthUser | null): void => {
    setCachedUser(userData);
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
      queryClient.setQueryData(queryKeys.auth.me, { user: userData });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: Boolean(token) && profileQuery.isLoading,
        loginUser,
        logoutUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook giving components streamlined access to the current user and the
// authentication control methods.
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
