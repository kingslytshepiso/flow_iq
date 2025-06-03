"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { User } from "../db/database";
import { useLanguage } from "../i18n/LanguageContext";
import { Role, hasPermission } from "./roles";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  updateUser: (userData: Partial<User>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    // Check for existing session on mount
    const checkAuth = async () => {
      try {
        console.log("Checking authentication status...");
        const response = await fetch("/api/auth/me", {
          credentials: "include", // Add this to send cookies
          headers: {
            "Cache-Control": "no-cache", // Prevent caching
          },
        });

        console.log("Auth check response status:", response.status);

        if (response.ok) {
          const data = await response.json();
          console.log("Auth check successful, user data:", data.user?.email);
          setUser(data.user);
        } else {
          console.log("Auth check failed with status:", response.status);
          const errorData = await response.json();
          console.log("Auth check error details:", errorData);
          setUser(null);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || t("errors.loginFailed"));
      }

      setUser(data.user);
      // Redirect to the appropriate dashboard based on user role
      const redirectPath = getRedirectPath(data.user.role);
      router.push(redirectPath);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.loginFailed"));
      throw err;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      setError(null);
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include", // Add this to ensure cookies are handled
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || t("errors.registerFailed"));
      }

      // Auto-login after registration
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.registerFailed"));
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include", // Add this to ensure cookies are handled
      });

      if (!response.ok) {
        throw new Error(t("errors.logoutFailed"));
      }

      setUser(null);
      router.push("/login");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.logoutFailed"));
      throw err;
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      setError(null);
      const response = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
        credentials: "include",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || t("errors.updateFailed"));
      }

      setUser(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.updateFailed"));
      throw err;
    }
  };

  const checkPermission = (permission: string): boolean => {
    if (!user) return false;
    return hasPermission(user.role as Role, permission);
  };

  // Helper function to determine the appropriate redirect path based on user role
  const getRedirectPath = (role: Role): string => {
    switch (role) {
      case "admin":
        return "/admin/users";
      case "manager":
        return "/cash-flow/dashboard";
      case "accountant":
        return "/cash-flow/dashboard";
      case "inventory_manager":
        return "/inventory/dashboard";
      case "viewer":
      default:
        return "/dashboard";
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        hasPermission: checkPermission,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
