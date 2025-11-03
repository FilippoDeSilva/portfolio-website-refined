"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Menu, User, X, LogOut } from "lucide-react";
import { useUserLocationInfo } from "@/components/shared";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useIsMobile } from "@/components/ui/use-mobile";
import { BrandLogo } from "@/components/shared/brand-logo";

const NAV_ITEMS = [
  { id: "home", label: "Home", href: "/#" },
  { id: "about", label: "About", href: "/#about" },
  { id: "skills", label: "Skills", href: "/#skills" },
  { id: "projects", label: "Projects", href: "/#projects" },
  { id: "contact", label: "Contact", href: "/#contact" },
  { id: "blog", label: "Blog", href: "/blog" },
];

export default function TitleBar({
  title,
  children,
  onLogout,
}: {
  title: string;
  children?: React.ReactNode;
  onLogout?: () => void;
}) {
  const [activeSection, setActiveSection] = useState("home");
  const { theme, setTheme } = useTheme();
  const userInfo = useUserLocationInfo();
  const pathname = usePathname();
  const router = useRouter();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Set Blog as active for /blog, /blog/[id], and /blog/admin
    if (
      pathname === "/blog" ||
      (pathname && pathname.startsWith("/blog/")) ||
      pathname === "/blog/admin"
    ) {
      setActiveSection("blog");
      return;
    }

    if (pathname === "/") {
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              setActiveSection(entry.target.id);
              break;
            }
          }
        },
        { rootMargin: "-40% 0px -60% 0px" } // Active when section is in the middle 20% of viewport
      );

      const homeSections = NAV_ITEMS.filter((item) => item.id !== "blog");
      homeSections.forEach(({ id }) => {
        const element = document.getElementById(id);
        if (element) observer.observe(element);
      });

      return () => {
        homeSections.forEach(({ id }) => {
          const element = document.getElementById(id);
          if (element) observer.unobserve(element);
        });
      };
    }
  }, [pathname]);

  const handleNavClick = (id: string) => {
    setActiveSection(id);

    if (id === "blog") {
      router.push("/blog");
      return;
    }

    if (id === "home" && pathname !== "/") {
      router.push("/");
      return;
    }

    if (id === "home" && pathname === "/") {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    if (pathname === "/") {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push(`/#${id}`);
    }
  };
  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="fixed justify-between top-0 left-0 right-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md m-0 p-0">
      <div className="max-w-none w-full flex h-16 items-center justify-between px-3 sm:px-4 md:px-20 gap-2">
        <Link
          href="/"
          className="flex items-center gap-2 font-medium flex-shrink-0"
          onClick={() => setActiveSection("home")}
        >
          <div className="relative size-10 sm:size-12 flex items-center justify-center">
            <BrandLogo name={userInfo?.name} />
          </div>

          <span className="hidden xs:block text-base sm:text-lg font-medium tracking-tight truncate max-w-[120px] sm:max-w-[200px]">
            {userInfo?.name || ""}
          </span>
        </Link>
        <nav className="hidden md:flex gap-8">
          {NAV_ITEMS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => handleNavClick(id)}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                activeSection === id ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-1 xs:gap-2 sm:gap-4">
          <button
            aria-label="Toggle Theme"
            className="rounded-full p-1.5 xs:p-2 hover:bg-primary/10 transition-colors flex-shrink-0"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                className="xs:w-5 xs:h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.95l-.71.71M21 12h-1M4 12H3m16.95 7.95l-.71-.71M4.05 4.05l-.71-.71M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  style={{ color: "#3b82f6" }}
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                className="xs:w-5 xs:h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"
                />
              </svg>
            )}
          </button>

          {/* Hamburger Button */}
          <button
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            className="rounded-full p-1.5 xs:p-2 hover:bg-primary/10 transition-colors focus:outline-none md:hidden flex-shrink-0"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            style={{ width: 36, height: 36 }}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 xs:w-6 xs:h-6 text-gray-700 dark:text-gray-300" />
            ) : (
              <Menu className="w-5 h-5 xs:w-6 xs:h-6 text-gray-700 dark:text-gray-300" />
            )}
          </button>
          <div className="hidden md:flex">
            {children}
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              key="mobile-menu-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="fixed inset-0 top-16 z-40 bg-black/40 dark:bg-black/60 backdrop-blur-md md:hidden"
              aria-hidden="true"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            {/* Menu */}
            <motion.nav
              key="mobile-menu"
              id="mobile-menu"
              initial={{ y: -20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.95 }}
              transition={{ 
                duration: 0.4, 
                ease: [0.34, 1.56, 0.64, 1],
                opacity: { duration: 0.25 }
              }}
              className="fixed left-4 right-4 top-20 z-50 max-h-[calc(100vh-6rem)] bg-gradient-to-br from-background via-background to-background/95 backdrop-blur-2xl shadow-2xl border border-border flex flex-col md:hidden rounded-2xl"
              role="dialog"
              aria-modal="true"
              tabIndex={-1}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="py-4 px-4">
                <ul className="w-full flex flex-col gap-2">
                  {NAV_ITEMS.map(({ id, label, href }, index) => (
                    <motion.li 
                      key={id} 
                      className="w-full"
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ 
                        delay: index * 0.05,
                        duration: 0.3,
                        ease: [0.4, 0, 0.2, 1]
                      }}
                    >
                      <a
                        href={href}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNavClick(id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`group relative block w-full text-left py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 overflow-hidden ${
                          activeSection === id
                            ? "bg-gradient-to-r from-primary/20 to-primary/10 text-primary shadow-lg shadow-primary/20"
                            : "text-foreground/80 hover:text-foreground hover:bg-muted/50 active:scale-[0.98]"
                        }`}
                        tabIndex={0}
                        aria-current={activeSection === id ? "page" : undefined}
                      >
                        {activeSection === id && (
                          <motion.div
                            layoutId="active-pill"
                            className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-xl"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                        <span className="relative z-10 flex items-center gap-3">
                          <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                            activeSection === id 
                              ? "bg-primary scale-100" 
                              : "bg-muted-foreground/30 scale-0 group-hover:scale-100"
                          }`} />
                          {label}
                        </span>
                      </a>
                    </motion.li>
                  ))}
                </ul>
                
                {onLogout && (
                  <motion.div 
                    className="mt-4 pt-4 border-t border-border/50"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: NAV_ITEMS.length * 0.05 + 0.1, duration: 0.3 }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="group flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 active:scale-[0.98] border-2 border-red-200/50 dark:border-red-800/50 hover:border-red-300 dark:hover:border-red-700"
                      tabIndex={0}
                    >
                      <LogOut className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" />
                      <span>Sign Out</span>
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
