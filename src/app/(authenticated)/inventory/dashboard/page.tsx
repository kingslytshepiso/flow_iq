"use client";

import { useAuth } from "@/lib/auth/AuthContext";

export default function InventoryDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Inventory Overview Card */}
        <div className="bg-[var(--card)] rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-[var(--text)] mb-4">
            Inventory Overview
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-[var(--text)]/70">Total Items</span>
              <span className="font-medium text-[var(--text)]">0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text)]/70">Low Stock Items</span>
              <span className="font-medium text-[var(--text)]">0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text)]/70">Out of Stock</span>
              <span className="font-medium text-[var(--text)]">0</span>
            </div>
          </div>
        </div>

        {/* Recent Orders Card */}
        <div className="bg-[var(--card)] rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-[var(--text)] mb-4">
            Recent Orders
          </h3>
          <div className="space-y-4">
            <p className="text-[var(--text)]/70">No recent orders</p>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-[var(--card)] rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-[var(--text)] mb-4">
            Quick Actions
          </h3>
          <div className="space-y-4">
            <button className="w-full bg-[var(--primary)] text-white py-2 px-4 rounded hover:bg-[var(--primary)]/90 transition-colors">
              Add New Item
            </button>
            <button className="w-full bg-[var(--secondary)] text-white py-2 px-4 rounded hover:bg-[var(--secondary)]/90 transition-colors">
              Create Order
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Analysis Section */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--card)] rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-[var(--text)] mb-4">
            Stock Level Trends
          </h3>
          <div className="h-64 flex items-center justify-center">
            <p className="text-[var(--text)]/70">Chart placeholder</p>
          </div>
        </div>

        <div className="bg-[var(--card)] rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-[var(--text)] mb-4">
            Category Distribution
          </h3>
          <div className="h-64 flex items-center justify-center">
            <p className="text-[var(--text)]/70">Chart placeholder</p>
          </div>
        </div>
      </div>
    </div>
  );
}
