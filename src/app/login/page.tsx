"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Lock,
  User as UserIcon,
  Loader2,
  Package,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect to /products
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const redirectUrl = searchParams.get("redirect") || "/products";
      router.replace(redirectUrl);
    }
  }, [authLoading, isAuthenticated, router, searchParams]);

  // Demo credential auto-fill helper
  const handleAutoFill = () => {
    setUsername("emilys");
    setPassword("emilyspass");
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent multiple rapid clicks
    if (isSubmitting) return;

    if (!username.trim() || !password) {
      setErrorMessage("Please enter both username and password.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await login({ username, password });
      const redirectUrl = searchParams.get("redirect") || "/products";
      router.push(redirectUrl);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Invalid credentials. Please verify your username and password.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Header Branding */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 shadow-xl shadow-indigo-500/25 mb-4 ring-1 ring-white/20">
          <Package className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          NexusAdmin Dashboard
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Sign in to manage inventory, catalog & products
        </p>
      </div>

      {/* Login Card */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
        {/* Quick Demo Credentials Banner */}
        <div className="mb-6 p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Assignment Demo Credentials
            </span>
            <p className="text-slate-400">
              User: <code className="text-indigo-200 font-mono">emilys</code> | Pass:{" "}
              <code className="text-indigo-200 font-mono">emilyspass</code>
            </p>
          </div>

          <button
            type="button"
            onClick={handleAutoFill}
            className="shrink-0 px-2.5 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-500 text-white font-medium transition-colors shadow-sm text-xs"
          >
            Auto-fill
          </button>
        </div>

        {/* Error Message Alert */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-200 flex items-start gap-2.5 text-xs animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Field */}
          <div>
            <label
              htmlFor="username"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
            >
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <UserIcon className="w-4 h-4" />
              </div>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. emilys"
                autoComplete="username"
                required
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="w-full pl-10 pr-10 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button with Rapid-click / Double-submit Protection */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign in to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Footer info */}
      <p className="text-center text-xs text-slate-500 mt-6">
        Powered by DummyJSON Auth API &bull; Frontend Assignment
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-100">
      <Suspense
        fallback={
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            <span className="text-xs text-slate-400">Loading authentication...</span>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
