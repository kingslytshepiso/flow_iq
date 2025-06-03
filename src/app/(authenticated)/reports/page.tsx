"use client";

import { useAuth } from "@/lib/auth/AuthContext";
import cashFlowData from "@/lib/data/cash_flow_data.json";
import inventoryData from "@/lib/data/inventory_data.json";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { exportToPDF } from "@/lib/utils/pdfExport";
import {
  FinancialMetrics,
  InventoryMetrics,
  SalesMetrics,
} from "@/types/reports";
import {
  ArcElement,
  CategoryScale,
  ChartData,
  Chart as ChartJS,
  ChartOptions,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Doughnut, Line } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function ReportsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Chart refs with proper typing
  const lineChartRef = useRef<ChartJS<"line">>(null);
  const doughnutChartRef = useRef<ChartJS<"doughnut">>(null);

  const [financialMetrics, setFinancialMetrics] = useState<FinancialMetrics>({
    totalSales: 0,
    totalExpenses: 0,
    netCashFlow: 0,
    inventoryValue: 0,
    totalAssets: 0,
  });
  const [salesMetrics, setSalesMetrics] = useState<SalesMetrics>({
    dailyAverage: 0,
    highestSale: 0,
    lowestSale: 0,
    totalTransactions: 0,
  });
  const [inventoryMetrics, setInventoryMetrics] = useState<InventoryMetrics>({
    totalItems: 0,
    lowStockItems: 0,
    categories: {},
    totalValue: 0,
  });
  const [notifications, setNotifications] = useState({
    lowStock: true,
    salesAlerts: true,
    expenseAlerts: true,
    inventoryUpdates: true,
  });

  // Get computed theme colors
  const getThemeColors = () => {
    const style = getComputedStyle(document.documentElement);
    return {
      text: style.getPropertyValue("--text").trim(),
      border: style.getPropertyValue("--border").trim(),
      background: style.getPropertyValue("--background").trim(),
    };
  };

  // Update chart colors when theme changes
  const updateChartColors = () => {
    const colors = getThemeColors();

    if (lineChartRef.current) {
      const chart = lineChartRef.current;
      const options = chart.options as ChartOptions<"line">;

      if (options.plugins?.legend?.labels) {
        options.plugins.legend.labels.color = colors.text;
      }

      if (options.scales?.x?.ticks) {
        options.scales.x.ticks.color = colors.text;
      }

      if (options.scales?.y?.ticks) {
        options.scales.y.ticks.color = colors.text;
      }

      if (options.scales?.x?.grid) {
        options.scales.x.grid.color = colors.border;
      }

      if (options.scales?.y?.grid) {
        options.scales.y.grid.color = colors.border;
      }

      chart.update();
    }

    if (doughnutChartRef.current) {
      const chart = doughnutChartRef.current;
      const options = chart.options as ChartOptions<"doughnut">;

      if (options.plugins?.legend?.labels) {
        options.plugins.legend.labels.color = colors.text;
      }

      chart.update();
    }
  };

  // Theme change observer
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "data-theme") {
          const newTheme = document.documentElement.getAttribute(
            "data-theme"
          ) as "light" | "dark";
          setTheme(newTheme);
          updateChartColors();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Calculate financial metrics
    const totalSales = cashFlowData.sales.reduce(
      (sum, sale) => sum + sale.amount,
      0
    );
    const totalExpenses = cashFlowData.expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    const netCashFlow = totalSales - totalExpenses;

    // Calculate inventory value
    const inventoryValue = inventoryData.inventory_items.reduce(
      (sum, item) =>
        sum +
        item.price *
          (inventoryData.stock_levels.find(
            (level) => level.item_id === item.item_id
          )?.stock_level || 0),
      0
    );

    setFinancialMetrics({
      totalSales,
      totalExpenses,
      netCashFlow,
      inventoryValue,
      totalAssets: netCashFlow + inventoryValue,
    });

    // Calculate sales metrics
    const salesAmounts = cashFlowData.sales.map((sale) => sale.amount);
    const dailyAverage = totalSales / cashFlowData.sales.length;
    const highestSale = Math.max(...salesAmounts);
    const lowestSale = Math.min(...salesAmounts);

    setSalesMetrics({
      dailyAverage,
      highestSale,
      lowestSale,
      totalTransactions: cashFlowData.sales.length,
    });

    // Calculate inventory metrics
    const categories: { [key: string]: number } = {};
    inventoryData.inventory_items.forEach((item) => {
      categories[item.category] = (categories[item.category] || 0) + 1;
    });

    const lowStockItems = inventoryData.stock_levels.filter(
      (level) => level.stock_level <= level.reorder_level
    ).length;

    setInventoryMetrics({
      totalItems: inventoryData.inventory_items.length,
      lowStockItems,
      categories,
      totalValue: inventoryValue,
    });
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Prepare data for Sales Trends chart
  const salesTrendsData: ChartData<"line"> = {
    labels: cashFlowData.sales.map((sale) =>
      new Date(sale.date).toLocaleDateString()
    ),
    datasets: [
      {
        label: "Sales",
        data: cashFlowData.sales.map((sale) => sale.amount),
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.5)",
        tension: 0.4,
      },
    ],
  };

  const salesTrendsOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: getThemeColors().text,
          font: {
            size: 12,
          },
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: getThemeColors().background,
        titleColor: getThemeColors().text,
        bodyColor: getThemeColors().text,
        borderColor: getThemeColors().border,
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: function (context: any) {
            return `Sales: ${formatCurrency(context.raw)}`;
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          color: getThemeColors().text,
          font: {
            size: 11,
          },
          callback: function (value: any) {
            return formatCurrency(value);
          },
        },
        grid: {
          color: getThemeColors().border,
        },
      },
      x: {
        ticks: {
          color: getThemeColors().text,
          font: {
            size: 11,
          },
        },
        grid: {
          color: getThemeColors().border,
        },
      },
    },
  };

  // Prepare data for Inventory Categories chart
  const inventoryCategoriesData: ChartData<"doughnut"> = {
    labels: Object.keys(inventoryMetrics.categories),
    datasets: [
      {
        data: Object.values(inventoryMetrics.categories),
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)", // Blue
          "rgba(16, 185, 129, 0.8)", // Green
          "rgba(245, 158, 11, 0.8)", // Yellow
          "rgba(139, 92, 246, 0.8)", // Purple
          "rgba(236, 72, 153, 0.8)", // Pink
          "rgba(239, 68, 68, 0.8)", // Red
        ],
        borderColor: "var(--background)",
        borderWidth: 2,
      },
    ],
  };

  const inventoryCategoriesOptions: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          color: getThemeColors().text,
          font: {
            size: 12,
          },
          padding: 20,
          boxWidth: 15,
        },
      },
      tooltip: {
        backgroundColor: getThemeColors().background,
        titleColor: getThemeColors().text,
        bodyColor: getThemeColors().text,
        borderColor: getThemeColors().border,
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: function (context: any) {
            const value = context.raw;
            const total = context.dataset.data.reduce(
              (a: number, b: number) => a + b,
              0
            );
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${value} items (${percentage}%)`;
          },
        },
      },
    },
  };

  const handleExport = () => {
    const lowStockItems = inventoryData.inventory_items
      .map((item) => {
        const stock = inventoryData.stock_levels.find(
          (level) => level.item_id === item.item_id
        );
        if (stock && stock.stock_level <= stock.reorder_level) {
          return {
            name: item.name,
            category: item.category,
            currentStock: stock.stock_level,
            reorderLevel: stock.reorder_level,
          };
        }
        return null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    exportToPDF({
      financialMetrics,
      salesMetrics,
      inventoryMetrics,
      lowStockItems,
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[var(--text)]">Reports</h1>
        <div className="flex gap-4">
          <button
            onClick={() => router.push("/ai-chat")}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
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
              <path d="M12 2a8 8 0 0 0-8 8c0 1.892.402 3.13 1.5 4.5L12 22l6.5-7.5c1.098-1.37 1.5-2.608 1.5-4.5a8 8 0 0 0-8-8z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Ask AI
          </button>
          <button
            onClick={handleExport}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
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
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" x2="12" y1="15" y2="3" />
            </svg>
            Export Report
          </button>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-[var(--card)] p-6 rounded-lg border border-[var(--border)]">
          <h2 className="text-lg font-semibold mb-4">Financial Overview</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Total Sales:</span>
              <span className="font-medium">
                {formatCurrency(financialMetrics.totalSales)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Total Expenses:</span>
              <span className="font-medium">
                {formatCurrency(financialMetrics.totalExpenses)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Net Cash Flow:</span>
              <span
                className={`font-medium ${
                  financialMetrics.netCashFlow >= 0
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {formatCurrency(financialMetrics.netCashFlow)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Inventory Value:</span>
              <span className="font-medium">
                {formatCurrency(financialMetrics.inventoryValue)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Total Assets:</span>
              <span className="font-medium">
                {formatCurrency(financialMetrics.totalAssets)}
              </span>
            </div>
          </div>
        </div>

        {/* Sales Performance */}
        <div className="bg-[var(--card)] p-6 rounded-lg border border-[var(--border)]">
          <h2 className="text-lg font-semibold mb-4">Sales Performance</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Daily Average:</span>
              <span className="font-medium">
                {formatCurrency(salesMetrics.dailyAverage)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Highest Sale:</span>
              <span className="font-medium">
                {formatCurrency(salesMetrics.highestSale)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Lowest Sale:</span>
              <span className="font-medium">
                {formatCurrency(salesMetrics.lowestSale)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Total Transactions:</span>
              <span className="font-medium">
                {salesMetrics.totalTransactions}
              </span>
            </div>
          </div>
        </div>

        {/* Inventory Analysis */}
        <div className="bg-[var(--card)] p-6 rounded-lg border border-[var(--border)]">
          <h2 className="text-lg font-semibold mb-4">Inventory Analysis</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Total Items:</span>
              <span className="font-medium">{inventoryMetrics.totalItems}</span>
            </div>
            <div className="flex justify-between">
              <span>Low Stock Items:</span>
              <span className="font-medium text-yellow-500">
                {inventoryMetrics.lowStockItems}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Total Value:</span>
              <span className="font-medium">
                {formatCurrency(inventoryMetrics.totalValue)}
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Categories:</h3>
              <div className="space-y-1">
                {Object.entries(inventoryMetrics.categories).map(
                  ([category, count]) => (
                    <div
                      key={category}
                      className="flex justify-between text-sm"
                    >
                      <span>{category}:</span>
                      <span>{count} items</span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trends Chart */}
        <div className="bg-[var(--card)] rounded-xl shadow-lg p-6 border border-[var(--border)]">
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
              <path d="M3 3v18h18" />
              <path d="m19 9-5 5-4-4-3 3" />
            </svg>
            Sales Trends
          </h2>
          <div className="h-64">
            <Line
              ref={lineChartRef}
              data={salesTrendsData}
              options={salesTrendsOptions}
            />
          </div>
        </div>

        {/* Inventory Categories Chart */}
        <div className="bg-[var(--card)] rounded-xl shadow-lg p-6 border border-[var(--border)]">
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
              <path d="M12 2v4" />
              <path d="M12 18v4" />
              <path d="m4.93 4.93 2.83 2.83" />
              <path d="m16.24 16.24 2.83 2.83" />
              <path d="M2 12h4" />
              <path d="M18 12h4" />
              <path d="m4.93 19.07 2.83-2.83" />
              <path d="m16.24 7.76 2.83-2.83" />
            </svg>
            Inventory Categories
          </h2>
          <div className="h-64">
            <Doughnut
              ref={doughnutChartRef}
              data={inventoryCategoriesData}
              options={inventoryCategoriesOptions}
            />
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      <div className="bg-[var(--card)] rounded-xl shadow-lg p-6 border border-[var(--border)]">
        <h2 className="text-lg font-semibold mb-4">Low Stock Alerts</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left py-2">Item</th>
                <th className="text-left py-2">Category</th>
                <th className="text-left py-2">Current Stock</th>
                <th className="text-left py-2">Reorder Level</th>
                <th className="text-left py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {inventoryData.inventory_items
                .map((item) => {
                  const stock = inventoryData.stock_levels.find(
                    (level) => level.item_id === item.item_id
                  );
                  if (stock && stock.stock_level <= stock.reorder_level) {
                    return { item, stock };
                  }
                  return null;
                })
                .filter(
                  (item): item is { item: any; stock: any } => item !== null
                )
                .map(({ item, stock }) => (
                  <tr
                    key={item.item_id}
                    className="border-b border-[var(--border)]"
                  >
                    <td className="py-2">{item.name}</td>
                    <td className="py-2">{item.category}</td>
                    <td className="py-2">{stock.stock_level}</td>
                    <td className="py-2">{stock.reorder_level}</td>
                    <td className="py-2">
                      <span className="text-yellow-500">Low Stock</span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-[var(--card)] rounded-xl shadow-lg p-6 border border-[var(--border)]">
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
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
          Notification Settings
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[var(--text)]">Low Stock Alerts</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={notifications.lowStock}
                onChange={(e) =>
                  setNotifications({
                    ...notifications,
                    lowStock: e.target.checked,
                  })
                }
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--text)]">Sales Alerts</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={notifications.salesAlerts}
                onChange={(e) =>
                  setNotifications({
                    ...notifications,
                    salesAlerts: e.target.checked,
                  })
                }
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--text)]">Expense Alerts</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={notifications.expenseAlerts}
                onChange={(e) =>
                  setNotifications({
                    ...notifications,
                    expenseAlerts: e.target.checked,
                  })
                }
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--text)]">Inventory Updates</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={notifications.inventoryUpdates}
                onChange={(e) =>
                  setNotifications({
                    ...notifications,
                    inventoryUpdates: e.target.checked,
                  })
                }
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
