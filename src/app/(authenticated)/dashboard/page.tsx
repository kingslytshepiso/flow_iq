"use client";

import { useAuth } from "@/lib/auth/AuthContext";
import cashFlowData from "@/lib/data/cash_flow_data.json";
import inventoryData from "@/lib/data/inventory_data.json";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();
  const [salesTotal, setSalesTotal] = useState<number>(0);
  const [expensesTotal, setExpensesTotal] = useState<number>(0);
  const [netCashFlow, setNetCashFlow] = useState<number>(0);
  const [inventoryValue, setInventoryValue] = useState<number>(0);
  const [lowStockItems, setLowStockItems] = useState<
    { item: any; stock: any }[]
  >([]);

  useEffect(() => {
    // Calculate totals from cash flow data
    const totalSales = cashFlowData.sales.reduce(
      (sum, sale) => sum + sale.amount,
      0
    );
    const totalExpenses = cashFlowData.expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );

    setSalesTotal(totalSales);
    setExpensesTotal(totalExpenses);
    setNetCashFlow(totalSales - totalExpenses);

    // Calculate inventory value and get low stock items from local data
    const totalValue = inventoryData.inventory_items.reduce(
      (sum, item) =>
        sum +
        item.price *
          (inventoryData.stock_levels.find(
            (level) => level.item_id === item.item_id
          )?.stock_level || 0),
      0
    );

    const lowStock = inventoryData.inventory_items
      .map((item) => {
        const stock = inventoryData.stock_levels.find(
          (level) => level.item_id === item.item_id
        );
        if (stock && stock.stock_level <= stock.reorder_level) {
          return { item, stock };
        }
        return null;
      })
      .filter((item): item is { item: any; stock: any } => item !== null);

    setInventoryValue(totalValue);
    setLowStockItems(lowStock);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="min-h-screen p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text)] mb-2">
          {t("dashboard.welcome.title", { name: user?.name ?? "User" })}
        </h1>
        <p className="text-[var(--text)]/70 text-lg">
          {t("dashboard.welcome.subtitle")}
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Financial Overview Card */}
        <div className="lg:col-span-2 bg-[var(--card)] backdrop-blur-sm rounded-xl shadow-lg p-6 border border-[var(--border)] hover:border-[var(--border-hover)] transition-colors">
          <h2 className="text-xl font-semibold text-[var(--text)] mb-6 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-blue-500"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
              <path d="M12 6v2" />
              <path d="M12 16v2" />
            </svg>
            {t("dashboard.financialOverview.title")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[var(--background)]/50 backdrop-blur-sm rounded-lg p-4 border border-[var(--border)]/50">
              <p className="text-[var(--text)]/70 text-sm mb-1">
                {t("dashboard.financialOverview.totalSales")}
              </p>
              <p className="text-2xl font-bold text-[var(--text)]">
                {formatCurrency(salesTotal)}
              </p>
            </div>
            <div className="bg-[var(--background)]/50 backdrop-blur-sm rounded-lg p-4 border border-[var(--border)]/50">
              <p className="text-[var(--text)]/70 text-sm mb-1">
                {t("dashboard.financialOverview.totalExpenses")}
              </p>
              <p className="text-2xl font-bold text-[var(--text)]">
                {formatCurrency(expensesTotal)}
              </p>
            </div>
            <div className="bg-[var(--background)]/50 backdrop-blur-sm rounded-lg p-4 border border-[var(--border)]/50">
              <p className="text-[var(--text)]/70 text-sm mb-1">
                {t("dashboard.financialOverview.netCashFlow")}
              </p>
              <p
                className={`text-2xl font-bold ${
                  netCashFlow >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {formatCurrency(netCashFlow)}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-[var(--card)] backdrop-blur-sm rounded-xl shadow-lg p-6 border border-[var(--border)] hover:border-[var(--border-hover)] transition-colors">
          <h2 className="text-xl font-semibold text-[var(--text)] mb-6 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-green-500"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            {t("dashboard.quickActions.title")}
          </h2>
          <div className="space-y-3">
            <button
              onClick={() => router.push("/reports")}
              className="w-full bg-blue-600/90 backdrop-blur-sm text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 border border-blue-500/20"
            >
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
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
                <path d="M16 13H8" />
                <path d="M16 17H8" />
                <path d="M10 9H8" />
              </svg>
              {t("dashboard.quickActions.viewReports")}
            </button>
            <button
              onClick={() => router.push("/cash-flow")}
              className="w-full bg-green-600/90 backdrop-blur-sm text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 border border-green-500/20"
            >
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
                <path d="M12 5v14M5 12h14" />
              </svg>
              {t("dashboard.quickActions.addTransaction")}
            </button>
            {lowStockItems.length > 0 && (
              <button
                onClick={() => router.push("/inventory")}
                className="w-full bg-yellow-600/90 backdrop-blur-sm text-white px-4 py-3 rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center gap-2 border border-yellow-500/20"
              >
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
                  <path d="M20 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2Z" />
                  <path d="M12 2v20" />
                  <path d="M2 12h20" />
                </svg>
                {t("dashboard.quickActions.reorderItems", {
                  count: lowStockItems.length,
                })}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Inventory Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inventory Status Card */}
        <div className="bg-[var(--card)] backdrop-blur-sm rounded-xl shadow-lg p-6 border border-[var(--border)] hover:border-[var(--border-hover)] transition-colors">
          <h2 className="text-xl font-semibold text-[var(--text)] mb-6 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-purple-500"
            >
              <path d="M20 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2Z" />
              <path d="M12 2v20" />
              <path d="M2 12h20" />
            </svg>
            {t("dashboard.inventoryStatus.title")}
          </h2>
          <div className="space-y-4">
            <div className="bg-[var(--background)]/50 backdrop-blur-sm rounded-lg p-4 border border-[var(--border)]/50">
              <p className="text-[var(--text)]/70 text-sm mb-1">
                {t("dashboard.inventoryStatus.totalValue")}
              </p>
              <p className="text-2xl font-bold text-[var(--text)]">
                {formatCurrency(inventoryValue)}
              </p>
            </div>
            <div className="bg-[var(--background)]/50 backdrop-blur-sm rounded-lg p-4 border border-[var(--border)]/50">
              <p className="text-[var(--text)]/70 text-sm mb-1">
                {t("dashboard.inventoryStatus.lowStockItems")}
              </p>
              <p className="text-2xl font-bold text-[var(--text)]">
                {lowStockItems.length}
              </p>
            </div>
          </div>
        </div>

        {/* Low Stock Items List */}
        {lowStockItems.length > 0 && (
          <div className="lg:col-span-2 bg-[var(--card)] backdrop-blur-sm rounded-xl shadow-lg p-6 border border-[var(--border)] hover:border-[var(--border-hover)] transition-colors">
            <h2 className="text-xl font-semibold text-[var(--text)] mb-6 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-yellow-500"
              >
                <path d="M12 9v2" />
                <path d="M12 17h.01" />
                <path d="M5.07 19H19a2 2 0 0 0 1.75-2.67l-7.07-12.27a2 2 0 0 0-3.5 0l-7.07 12.27A2 2 0 0 0 5.07 19z" />
              </svg>
              {t("dashboard.lowStockItems.title")}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-[var(--border)]">
                    <th className="pb-3 text-[var(--text)]/70 font-medium">
                      {t("dashboard.lowStockItems.item")}
                    </th>
                    <th className="pb-3 text-[var(--text)]/70 font-medium">
                      {t("dashboard.lowStockItems.currentStock")}
                    </th>
                    <th className="pb-3 text-[var(--text)]/70 font-medium">
                      {t("dashboard.lowStockItems.reorderLevel")}
                    </th>
                    <th className="pb-3 text-[var(--text)]/70 font-medium">
                      {t("dashboard.lowStockItems.status")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockItems.map(({ item, stock }) => (
                    <tr
                      key={item.item_id}
                      className="border-b border-[var(--border)] last:border-0"
                    >
                      <td className="py-3 text-[var(--text)]">{item.name}</td>
                      <td className="py-3 text-[var(--text)]">
                        {stock.stock_level}
                      </td>
                      <td className="py-3 text-[var(--text)]">
                        {stock.reorder_level}
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100/20 backdrop-blur-sm text-yellow-500 border border-yellow-500/20">
                          {t("dashboard.lowStockItems.lowStock")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
