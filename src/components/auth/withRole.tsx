"use client";

import { useAuth } from "@/lib/auth/AuthContext";
import { Role, hasPermission } from "@/lib/auth/roles";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface WithRoleProps {
  requiredRole: Role;
  requiredPermission?: string;
  children: React.ReactNode;
}

export function WithRole({
  requiredRole,
  requiredPermission,
  children,
}: WithRoleProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

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

  // Check if user has the required role
  const hasRequiredRole = user.role === requiredRole;

  // Check if user has the required permission (if specified)
  const hasRequiredPermission = requiredPermission
    ? hasPermission(user.role, requiredPermission)
    : true;

  if (!hasRequiredRole || !hasRequiredPermission) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-[var(--text)]">
          You don't have permission to access this page.
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
