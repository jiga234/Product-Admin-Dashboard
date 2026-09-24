import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = "https://dummyjson.com";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000,
});

// Request Interceptor: Attach auth token to every outgoing request
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Centralized error handling and 401 session expiration
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<{ message?: string }>) => {
    // If request was canceled/aborted intentionally, propagate as is
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    if (typeof window !== "undefined") {
      const status = error.response?.status;

      // Handle 401 Unauthorized (expired or invalid token)
      if (status === 401) {
        const isLoginPage = window.location.pathname.startsWith("/login");
        if (!isLoginPage) {
          // Notify app to clear auth state and redirect
          window.dispatchEvent(new CustomEvent("auth:unauthorized"));
        }
      }
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      "An unexpected network error occurred. Please try again.";

    // Attach custom message to error object
    const enhancedError = new Error(message);
    (enhancedError as unknown as { status?: number }).status = error.response?.status;
    (enhancedError as unknown as { rawError: AxiosError }).rawError = error;

    return Promise.reject(enhancedError);
  }
);

export default apiClient;
