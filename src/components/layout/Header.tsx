"use client";

import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth/AuthContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Language } from "@/lib/i18n/translations";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function Header() {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem("theme");
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";
    const initialTheme = savedTheme || systemTheme;
    setTheme(initialTheme as "light" | "dark");
    document.documentElement.setAttribute("data-theme", initialTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header className="bg-[var(--card)] border-b border-[var(--border)] h-16">
      <div className="h-full flex justify-between items-center px-8">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-[var(--text)]">
            {user ? "Dashboard" : "FlowIQ"}
          </h1>
          {user && (
            <span className="text-sm text-[var(--text)]/70">{user.email}</span>
          )}
        </div>
        <div className="flex items-center gap-4">
          {/* Language Switcher */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="bg-[var(--background)] text-[var(--text)] border border-[var(--border)] rounded-md px-2 py-1 text-sm theme-transition"
          >
            <option value="en">English</option>
            <option value="af">Afrikaans</option>
            <option value="zu">Zulu</option>
          </select>

          {/* Theme Toggler */}
          <Button
            variant="outline"
            onClick={toggleTheme}
            className="text-[var(--text)] p-2 theme-transition"
          >
            {theme === "light" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="m4.93 4.93 1.41 1.41" />
                <path d="m17.66 17.66 1.41 1.41" />
                <path d="M2 12h2" />
                <path d="M20 12h2" />
                <path d="m6.34 17.66-1.41 1.41" />
                <path d="m19.07 4.93-1.41 1.41" />
              </svg>
            )}
          </Button>

          {/* Auth Buttons */}
          {user ? (
            <Button
              variant="outline"
              onClick={handleLogout}
              isLoading={isLoading}
              className="h-9"
            >
              {t("auth.logout")}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push("/login")}
                className="h-9"
              >
                {t("auth.login")}
              </Button>
              <Button onClick={() => router.push("/register")} className="h-9">
                {t("auth.register")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
