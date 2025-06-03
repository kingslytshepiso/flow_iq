"use client";

import { Header } from "@/components/layout/Header";
import { useAuth } from "@/lib/auth/AuthContext";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: string;
  children?: NavItem[];
}

const navigationItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "📊",
  },
  {
    label: "Cash Flow",
    href: "/cash-flow",
    icon: "💰",
    children: [
      {
        label: "Overview",
        href: "/cash-flow/dashboard",
        icon: "📈",
      },
      {
        label: "Transactions",
        href: "/cash-flow/transactions",
        icon: "💸",
      },
      {
        label: "Categories",
        href: "/cash-flow/categories",
        icon: "🏷️",
      },
    ],
  },
  {
    label: "Inventory",
    href: "/inventory",
    icon: "📦",
    children: [
      {
        label: "Overview",
        href: "/inventory/dashboard",
        icon: "📊",
      },
      {
        label: "Products",
        href: "/inventory/products",
        icon: "🏷️",
      },
      {
        label: "Orders",
        href: "/inventory/orders",
        icon: "🛒",
      },
    ],
  },
  {
    label: "Reports",
    href: "/reports",
    icon: "📈",
    children: [
      {
        label: "Financial",
        href: "/reports/financial",
        icon: "💰",
      },
      {
        label: "Inventory",
        href: "/reports/inventory",
        icon: "📦",
      },
      {
        label: "Sales",
        href: "/reports/sales",
        icon: "📊",
      },
    ],
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: "👥",
  },
];

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
        <div className="text-[var(--text)]">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <div className="flex">
        {/* Side Navigation */}
        <aside
          className={`bg-[var(--card)] border-r border-[var(--border)] transition-all duration-300 ${
            isCollapsed ? "w-16" : "w-64"
          }`}
        >
          <div className="p-4 flex justify-end">
            <button
              onClick={toggleCollapse}
              className="p-2 rounded-md hover:bg-[var(--background)]"
            >
              {isCollapsed ? "→" : "←"}
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
                      }`}
                      onClick={() => item.children && toggleExpand(item.href)}
                    >
                      <span className="mr-3">{item.icon}</span>
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
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
