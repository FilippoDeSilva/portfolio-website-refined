"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-muted/20 to-background relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-4 relative z-10"
      >
        <div className="rounded-3xl bg-gradient-to-br from-background/95 via-background/90 to-background/95 backdrop-blur-2xl shadow-2xl border border-border/50 p-8 sm:p-10">
          {/* Header with Icon */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-blue-500/20 mb-4"
            >
              <Lock className="w-8 h-8 text-primary" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-blue-500 to-primary bg-clip-text text-transparent"
            >
              Admin Portal
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-sm sm:text-base text-muted-foreground flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Welcome back! Sign in to continue
            </motion.p>
          </div>
          <motion.form
            onSubmit={onLogin}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-5"
          >
            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-foreground"
              >
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  className="w-full rounded-xl border-2 border-border bg-background/50 pl-12 pr-4 py-3 text-base focus:outline-none focus:border-primary focus:bg-background transition-all duration-200 hover:border-primary/50"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-foreground"
              >
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  required
                  className="w-full rounded-xl border-2 border-border bg-background/50 pl-12 pr-12 py-3 text-base focus:outline-none focus:border-primary focus:bg-background transition-all duration-200 hover:border-primary/50"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary focus:outline-none transition-colors"
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
            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loginLoading}
              whileHover={{ scale: loginLoading ? 1 : 1.02 }}
              whileTap={{ scale: loginLoading ? 1 : 0.98 }}
              className="w-full mt-6 px-6 py-3.5 text-base font-bold rounded-xl shadow-lg bg-gradient-to-r from-primary via-blue-500 to-primary bg-size-200 bg-pos-0 hover:bg-pos-100 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-500 flex items-center justify-center gap-2 relative overflow-hidden group"
            >
              {loginLoading && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <svg
                    className="h-5 w-5 text-white"
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
                </motion.div>
              )}
              <span>{loginLoading ? "Signing in..." : "Sign In"}</span>
              {!loginLoading && (
                <motion.div
                  className="absolute inset-0 bg-white/20"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.5 }}
                />
              )}
            </motion.button>
          </motion.form>
          {/* Error Message */}
          {loginError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 flex items-start gap-3 bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl px-4 py-3 shadow-sm"
            >
              <svg
                className="w-5 h-5 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-semibold">Authentication Failed</p>
                <p className="text-xs mt-0.5">{loginError}</p>
              </div>
              <button
                className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
                onClick={() => setLoginError(null)}
                aria-label="Dismiss error"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
