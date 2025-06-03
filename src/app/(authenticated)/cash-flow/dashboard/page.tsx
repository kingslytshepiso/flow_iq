"use client";

import { useAuth } from "@/lib/auth/AuthContext";

export default function CashFlowDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Cash Flow Overview Card */}
        <div className="bg-[var(--card)] rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-[var(--text)] mb-4">
            Cash Flow Overview
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-[var(--text)]/70">Current Balance</span>
              <span className="font-medium text-[var(--text)]">R 0.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text)]/70">Monthly Income</span>
              <span className="font-medium text-[var(--text)]">R 0.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text)]/70">Monthly Expenses</span>
              <span className="font-medium text-[var(--text)]">R 0.00</span>
            </div>
          </div>
        </div>

        {/* AI Forecasting Card */}
        <div className="bg-[var(--card)] rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-[var(--text)] mb-4">
            AI Cash Flow Forecast
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-[var(--text)]/70">Next 30 Days</span>
              <span className="font-medium text-[var(--text)]">R 0.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text)]/70">Next 90 Days</span>
              <span className="font-medium text-[var(--text)]">R 0.00</span>
            </div>
          </div>
        </div>

        {/* Recent Transactions Card */}
        <div className="bg-[var(--card)] rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-[var(--text)] mb-4">
            Recent Transactions
          </h3>
          <div className="space-y-4">
            <p className="text-[var(--text)]/70">No recent transactions</p>
          </div>
        </div>
      </div>

      {/* Charts and Detailed Analysis Section */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--card)] rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-[var(--text)] mb-4">
            Cash Flow Trends
          </h3>
          <div className="h-64 flex items-center justify-center">
            <p className="text-[var(--text)]/70">Chart placeholder</p>
          </div>
        </div>

        <div className="bg-[var(--card)] rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-[var(--text)] mb-4">
            Expense Categories
          </h3>
          <div className="h-64 flex items-center justify-center">
            <p className="text-[var(--text)]/70">Chart placeholder</p>
          </div>
        </div>
      </div>
    </div>
  );
}
