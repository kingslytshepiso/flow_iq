"use client";

import { useAuth } from "@/lib/auth/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-[var(--card)] rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-[var(--text)] mb-4">
          Welcome, {user?.name}
        </h2>
        <p className="text-[var(--text)]/70">
          This is your personalized dashboard. Use the navigation menu to access
          different features.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <div className="bg-[var(--card)] rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-[var(--text)] mb-4">
            Quick Stats
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-[var(--text)]/70">Role</span>
              <span className="font-medium text-[var(--text)]">
                {user?.role}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text)]/70">Last Login</span>
              <span className="font-medium text-[var(--text)]">Today</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[var(--card)] rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-[var(--text)] mb-4">
            Recent Activity
          </h3>
          <div className="space-y-4">
            <p className="text-[var(--text)]/70">No recent activity</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[var(--card)] rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-[var(--text)] mb-4">
            Quick Actions
          </h3>
          <div className="space-y-4">
            <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
              View Reports
            </button>
            <button className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
              Add Transaction
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
