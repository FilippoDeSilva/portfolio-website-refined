"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function BlogPostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Set default theme to system if not already set
    if (!theme) {
      setTheme("system");
    }
  }, [theme, setTheme]);

  const cycleTheme = () => {
    if (theme === "dark") {
      setTheme("system");
    } else if (theme === "system") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  const getThemeIcon = () => {
    if (!mounted) return null;
    
    if (theme === "dark") {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      );
    } else if (theme === "system") {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    } else {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
    }
  };

  const getThemeLabel = () => {
    if (!mounted) return "";
    if (theme === "dark") return "Dark";
    if (theme === "system") return "Auto";
    return "Light";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Static Navigation Bar - Prerendered */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/blog" className="group flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              All Posts
            </Link>

            {/* Animated Theme Selector */}
            {mounted && (
              <div className="relative h-10 w-[100px] rounded-full bg-muted/30 border border-border/50 shadow-sm">
                {/* Animated Sliding Indicator */}
                <div
                  className="absolute top-1 w-8 h-8 rounded-full bg-primary shadow-lg transition-all duration-300 ease-out"
                  style={{
                    left: theme === "dark" ? "4px" : theme === "system" ? "36px" : "68px",
                  }}
                />

                {/* Dark Mode */}
                <button
                  onClick={() => setTheme("dark")}
                  className={`absolute left-1 top-1 w-8 h-8 rounded-full transition-all duration-300 ${
                    theme === "dark"
                      ? "text-primary-foreground scale-110"
                      : "text-muted-foreground hover:text-foreground hover:scale-105"
                  }`}
                  style={{ zIndex: 10 }}
                  aria-label="Dark mode"
                >
                  <svg 
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 ${
                      theme === "dark" ? "rotate-0" : "rotate-12"
                    }`}
                    width="16" 
                    height="16"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                </button>

                {/* System Mode */}
                <button
                  onClick={() => setTheme("system")}
                  className={`absolute left-[36px] top-1 w-8 h-8 rounded-full transition-all duration-300 ${
                    theme === "system"
                      ? "text-primary-foreground scale-110"
                      : "text-muted-foreground hover:text-foreground hover:scale-105"
                  }`}
                  style={{ zIndex: 10 }}
                  aria-label="System mode"
                >
                  <svg 
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 ${
                      theme === "system" ? "scale-100" : "scale-90"
                    }`}
                    width="16" 
                    height="16"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </button>

                {/* Light Mode */}
                <button
                  onClick={() => setTheme("light")}
                  className={`absolute left-[68px] top-1 w-8 h-8 rounded-full transition-all duration-300 ${
                    theme === "light"
                      ? "text-primary-foreground scale-110"
                      : "text-muted-foreground hover:text-foreground hover:scale-105"
                  }`}
                  style={{ zIndex: 10 }}
                  aria-label="Light mode"
                >
                  <svg 
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 ${
                      theme === "light" ? "rotate-0" : "-rotate-45"
                    }`}
                    width="16" 
                    height="16"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Dynamic Blog Content - Streamed */}
      {children}
    </div>
  );
}
