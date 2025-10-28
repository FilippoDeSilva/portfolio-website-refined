"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface LoginFormProps {
  onLogin: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  loginLoading: boolean;
  loginError: string | null;
  setLoginError: (error: string | null) => void;
}

export function LoginForm({
  onLogin,
  loginLoading,
  loginError,
  setLoginError,
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md rounded-2xl bg-gradient-to-br from-blue-50/80 via-background/90 to-blue-100/60 dark:from-blue-950/40 dark:via-background/80 dark:to-blue-900/30 shadow-xl border border-border p-8 flex flex-col gap-6">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold mb-2 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600 bg-clip-text text-transparent drop-shadow-sm">
            Admin Login
          </h2>
          <p className="text-base text-muted-foreground mb-4">
            Welcome back! Please sign in to manage your blog.
          </p>
        </div>
        <form onSubmit={onLogin} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-muted-foreground mb-1"
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              required
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-muted-foreground mb-1"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                required
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-300 transition pr-12"
                placeholder="Enter your password"
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-blue-500 focus:outline-none"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 text-lg font-semibold rounded-lg shadow-md bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 focus:ring-2 focus:ring-blue-300 transition-all duration-150 flex items-center justify-center gap-2"
            disabled={loginLoading}
          >
            {loginLoading && (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
            )}
            {loginLoading ? "Logging in..." : "Login"}
          </button>
        </form>
        {loginError && (
          <div className="mb-4 flex items-center gap-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-500 text-red-700 dark:text-red-300 rounded-lg px-4 py-3 shadow-sm">
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728"
              />
            </svg>
            <span className="text-sm font-medium">{loginError}</span>
            <button
              className="ml-auto text-xs px-2 py-1 rounded hover:bg-red-100 dark:hover:bg-red-800 transition"
              onClick={() => setLoginError(null)}
              aria-label="Dismiss error"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
