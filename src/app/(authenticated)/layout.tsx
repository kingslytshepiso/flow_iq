"use client";

import { Header } from "@/components/layout/Header";
import { useAuth } from "@/lib/auth/AuthContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  children?: NavItem[];
}

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const { t } = useLanguage();

  const navigationItems: NavItem[] = [
    {
      label: t("navigation.dashboard"),
      href: "/dashboard",
      icon: (
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
          <rect width="7" height="9" x="3" y="3" rx="1" />
          <rect width="7" height="5" x="14" y="3" rx="1" />
          <rect width="7" height="9" x="14" y="12" rx="1" />
          <rect width="7" height="5" x="3" y="16" rx="1" />
        </svg>
      ),
    },
    {
      label: t("navigation.cashFlow"),
      href: "/cash-flow",
      icon: (
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
          <circle cx="12" cy="12" r="10" />
          <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
          <path d="M12 6v2" />
          <path d="M12 16v2" />
        </svg>
      ),
    },
    {
      label: t("navigation.inventory"),
      href: "/inventory",
      icon: (
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
          <path d="M20 7h-7m7 10h-7m7-5h-7M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
        </svg>
      ),
    },
    {
      label: t("navigation.reports"),
      href: "/reports",
      icon: (
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
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" x2="8" y1="13" y2="13" />
          <line x1="16" x2="8" y1="17" y2="17" />
          <line x1="10" x2="8" y1="9" y2="9" />
        </svg>
      ),
    },
    {
      label: t("navigation.admin"),
      href: "/admin",
      icon: (
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
          <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
          <path d="M12 14.5c-5 0-9 2.5-9 5.5v1h18v-1c0-3-4-5.5-9-5.5Z" />
        </svg>
      ),
    },
  ];

  useEffect(() => {
    const checkAuth = async () => {
      if (!loading) {
        if (!user) {
          console.log("No user found, redirecting to login");
          const callbackUrl = encodeURIComponent(pathname);
          router.push(`/login?callbackUrl=${callbackUrl}`);
        } else {
          console.log("User authenticated:", user.email);
        }
      }
    };

    checkAuth();
  }, [user, loading, router, pathname]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleExpand = (href: string) => {
    setExpandedItems((prev) =>
      prev.includes(href)
        ? prev.filter((item) => item !== href)
        : [...prev, href]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-[var(--text)]">{t("common.loading")}</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <div className="flex h-[calc(100vh-64px)]">
        {/* Side Navigation */}
        <aside
          className={`bg-[var(--card)] border-r border-[var(--border)] transition-all duration-300 h-full overflow-y-auto ${
            isCollapsed ? "w-16" : "w-64"
          }`}
        >
          <div className="p-4 flex justify-end sticky top-0 bg-[var(--card)] z-10">
            <button
              onClick={toggleCollapse}
              className="p-2 rounded-md hover:bg-[var(--background)]"
            >
              {isCollapsed ? (
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
                  <path d="m9 18 6-6-6-6" />
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
                  <path d="m15 18-6-6 6-6" />
                </svg>
              )}
            </button>
          </div>
          <nav className="p-4">
            <ul className="space-y-2">
              {navigationItems.map((item) => (
                <li key={item.href}>
                  <div className="flex flex-col">
                    <Link
                      href={item.href}
                      className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                        pathname.startsWith(item.href)
                          ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                          : "text-[var(--text)] hover:bg-[var(--background)]"
                      } ${isCollapsed ? "justify-center" : ""}`}
                      onClick={(e) => {
                        if (item.children) {
                          e.preventDefault();
                          toggleExpand(item.href);
                        }
                      }}
                    >
                      <span className={isCollapsed ? "" : "mr-3"}>
                        {item.icon}
                      </span>
                      {!isCollapsed && (
                        <>
                          <span className="flex-1">{item.label}</span>
                          {item.children && (
                            <span className="ml-2">
                              {expandedItems.includes(item.href) ? "▼" : "▶"}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                    {!isCollapsed &&
                      item.children &&
                      expandedItems.includes(item.href) && (
                        <ul className="ml-6 mt-1 space-y-1">
                          {item.children.map((child) => (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                                  pathname === child.href
                                    ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                                    : "text-[var(--text)] hover:bg-[var(--background)]"
                                }`}
                              >
                                <span className="mr-3">{child.icon}</span>
                                {child.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                  </div>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
