import { apiClient } from "./apiClient";
import { LoginResponse, User } from "@/types";

export interface LoginCredentials {
  username: string;
  password: string;
  expiresInMins?: number;
}

export const authService = {
  /**
   * Authenticate user with DummyJSON
   * Test account: username 'emilys', password 'emilyspass'
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>("/auth/login", {
      username: credentials.username.trim(),
      password: credentials.password,
      expiresInMins: credentials.expiresInMins || 60,
    });
    return response.data;
  },

  /**
   * Fetch current authenticated user details
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>("/auth/me");
    return response.data;
  },

  /**
   * Store token and user in localStorage and cookie
   */
  saveAuthSession: (authData: LoginResponse): void => {
    if (typeof window === "undefined") return;

    const token = authData.accessToken || authData.token || "";
    localStorage.setItem("auth_token", token);
    localStorage.setItem("auth_user", JSON.stringify(authData));

    // Also set cookie for middleware / server recognition
    document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`;
  },

  /**
   * Clear session data from localStorage and cookies
   */
  clearAuthSession: (): void => {
    if (typeof window === "undefined") return;

    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  },

  /**
   * Get stored token
   */
  getToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("auth_token");
  },

  /**
   * Get stored user
   */
  getStoredUser: (): User | null => {
    if (typeof window === "undefined") return null;
    const rawUser = localStorage.getItem("auth_user");
    if (!rawUser) return null;
    try {
      return JSON.parse(rawUser) as User;
    } catch {
      return null;
    }
  },
};
