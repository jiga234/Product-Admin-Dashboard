"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { authService, LoginCredentials } from "@/services/authService";
import { User, LoginResponse } from "@/types";
import { useToast } from "./ToastContext";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();
  const { info, error: toastError, success: toastSuccess } = useToast();

  const logout = useCallback(() => {
    authService.clearAuthSession();
    setUser(null);
    setToken(null);
    info("Logged out", "You have been logged out of your session.");
    router.push("/login");
  }, [router, info]);

  // Initialize session from local storage on mount
  useEffect(() => {
    try {
      const storedToken = authService.getToken();
      const storedUser = authService.getStoredUser();

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
      }
    } catch (err) {
      console.error("Failed to restore auth session:", err);
      authService.clearAuthSession();
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Listen for 401 unauthorized events dispatched by apiClient
  useEffect(() => {
    const handleUnauthorized = () => {
      authService.clearAuthSession();
      setUser(null);
      setToken(null);
      toastError("Session Expired", "Your session has expired. Please log in again.");
      router.push("/login");
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [router, toastError]);

  const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      const data = await authService.login(credentials);
      authService.saveAuthSession(data);
      setUser(data);
      setToken(data.accessToken || data.token || "");
      toastSuccess(
        `Welcome, ${data.firstName || data.username}!`,
        "You have logged in successfully."
      );
      return data;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Invalid username or password";
      throw new Error(message);
    }
  };

  const isAuthenticated = Boolean(token && user);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
