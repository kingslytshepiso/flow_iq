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
    // Check for saved theme preference
    const savedTheme =
      (localStorage.getItem("theme") as "light" | "dark") || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
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
    <header className="border-b border-border/50 backdrop-blur-sm bg-background/30 h-16">
      <div className="h-full flex justify-between items-center px-8">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-primary"
            >
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Ask AI Button */}
          <Button
            variant="outline"
            onClick={() => router.push("/ai-chat")}
            className="h-9 flex items-center gap-2 bg-background/50 hover:bg-background/70 border-border/50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-purple-600"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              <path d="M8 10h.01" />
              <path d="M12 10h.01" />
              <path d="M16 10h.01" />
            </svg>
            {t("aiChat.askAI")}
          </Button>

          {/* Language Switcher */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="bg-background/50 text-text border border-border/50 rounded-md px-2 py-1 text-sm hover:bg-background/70 focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="en">English</option>
            <option value="zu">Zulu</option>
          </select>

          {/* Theme Toggler */}
          <Button
            variant="outline"
            onClick={toggleTheme}
            className="text-text p-2 bg-background/50 hover:bg-background/70 border-border/50"
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
              className="h-9 bg-background/50 hover:bg-background/70 border-border/50"
            >
              {t("auth.logout")}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push("/login")}
                className="h-9 bg-background/50 hover:bg-background/70 border-border/50"
              >
                {t("auth.login")}
              </Button>
              <Button
                onClick={() => router.push("/register")}
                className="h-9 bg-primary hover:bg-primary-hover text-white"
              >
                {t("auth.register")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
