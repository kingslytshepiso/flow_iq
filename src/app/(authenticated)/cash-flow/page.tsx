"use client";

import { useAuth } from "@/lib/auth/AuthContext";
import cashFlowData from "@/lib/data/cash_flow_data.json";
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
  RadialLinearScale,
  Title,
  Tooltip,
} from "chart.js";
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
  ArcElement,
  RadialLinearScale
);

export default function CashFlowDashboardPage() {
  const { user } = useAuth();
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(0);
  const [next30Days, setNext30Days] = useState<number>(0);
  const [next90Days, setNext90Days] = useState<number>(0);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Chart refs with proper typing
  const lineChartRef = useRef<ChartJS<"line">>(null);
  const doughnutChartRef = useRef<ChartJS<"doughnut">>(null);

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
    // Calculate totals from cash flow data
    const totalSales = cashFlowData.sales.reduce(
      (sum, sale) => sum + sale.amount,
      0
    );
    const totalExpenses = cashFlowData.expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );

    setCurrentBalance(totalSales - totalExpenses);
    setMonthlyIncome(totalSales);
    setMonthlyExpenses(totalExpenses);

    // Simple forecasting (can be enhanced with more sophisticated logic)
    setNext30Days(totalSales - totalExpenses);
    setNext90Days((totalSales - totalExpenses) * 3);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Prepare data for Cash Flow Trends chart
  const cashFlowTrendsData: ChartData<"line"> = {
    labels: cashFlowData.sales.map((sale) =>
      new Date(sale.date).toLocaleDateString()
    ),
    datasets: [
      {
        label: "Income",
        data: cashFlowData.sales.map((sale) => sale.amount),
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.5)",
        tension: 0.4,
      },
      {
        label: "Expenses",
        data: cashFlowData.expenses.map((expense) => expense.amount),
        borderColor: "rgb(239, 68, 68)",
        backgroundColor: "rgba(239, 68, 68, 0.5)",
        tension: 0.4,
      },
    ],
  };

  const cashFlowTrendsOptions: ChartOptions<"line"> = {
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
            return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
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

  // Prepare data for Expense Categories chart
  const expenseCategories = cashFlowData.expenses.reduce(
    (acc: any, expense) => {
      const category = expense.description.split(" - ")[0]; // Extract main category
      acc[category] = (acc[category] || 0) + expense.amount;
      return acc;
    },
    {}
  );

  const expenseCategoriesData: ChartData<"doughnut"> = {
    labels: Object.keys(expenseCategories),
    datasets: [
      {
        data: Object.values(expenseCategories),
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)", // Blue
          "rgba(16, 185, 129, 0.8)", // Green
          "rgba(245, 158, 11, 0.8)", // Yellow
          "rgba(139, 92, 246, 0.8)", // Purple
          "rgba(236, 72, 153, 0.8)", // Pink
          "rgba(239, 68, 68, 0.8)", // Red
        ],
        borderColor: getThemeColors().background,
        borderWidth: 2,
      },
    ],
  };

  const expenseCategoriesOptions: ChartOptions<"doughnut"> = {
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
            return `${context.label}: ${formatCurrency(
              value
            )} (${percentage}%)`;
          },
        },
      },
    },
  };

  // Prepare data for Gauge Chart
  const gaugeData: ChartData<"doughnut"> = {
    datasets: [
      {
        data: [currentBalance, 100000 - currentBalance], // Current balance vs remaining to target
        backgroundColor: [
          currentBalance >= 100000 ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)", // Green if target reached, red if not
          "rgb(229, 231, 235)", // Gray for remaining
        ],
        borderWidth: 0,
        circumference: 180,
        rotation: 270,
      },
    ],
  };

  const gaugeOptions: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "80%",
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
  };

  return (
    <div className="min-h-screen bg-[var(--background)] p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text)] mb-2">
          Cash Flow Management
        </h1>
        <p className="text-[var(--text)]/70 text-lg">
          Track and analyze your business finances
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Cash Flow Overview Card */}
        <div className="lg:col-span-2 bg-[var(--card)] rounded-xl shadow-lg p-6 border border-[var(--border)]">
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
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            Cash Flow Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[var(--background)] rounded-lg p-4">
              <p className="text-[var(--text)]/70 text-sm mb-1">
                Current Balance
              </p>
              <p className="text-2xl font-bold text-[var(--text)]">
                {formatCurrency(currentBalance)}
              </p>
            </div>
            <div className="bg-[var(--background)] rounded-lg p-4">
              <p className="text-[var(--text)]/70 text-sm mb-1">
                Monthly Income
              </p>
              <p className="text-2xl font-bold text-[var(--text)]">
                {formatCurrency(monthlyIncome)}
              </p>
            </div>
            <div className="bg-[var(--background)] rounded-lg p-4">
              <p className="text-[var(--text)]/70 text-sm mb-1">
                Monthly Expenses
              </p>
              <p className="text-2xl font-bold text-[var(--text)]">
                {formatCurrency(monthlyExpenses)}
              </p>
            </div>
          </div>
        </div>

        {/* AI Forecasting Card */}
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
              <path d="M12 2v4" />
              <path d="M12 18v4" />
              <path d="m4.93 4.93 2.83 2.83" />
              <path d="m16.24 16.24 2.83 2.83" />
              <path d="M2 12h4" />
              <path d="M18 12h4" />
              <path d="m4.93 19.07 2.83-2.83" />
              <path d="m16.24 7.76 2.83-2.83" />
            </svg>
            AI Cash Flow Forecast
          </h2>
          <div className="space-y-4">
            <div className="bg-[var(--background)] rounded-lg p-4">
              <p className="text-[var(--text)]/70 text-sm mb-1">Next 30 Days</p>
              <p className="text-2xl font-bold text-[var(--text)]">
                {formatCurrency(next30Days)}
              </p>
            </div>
            <div className="bg-[var(--background)] rounded-lg p-4">
              <p className="text-[var(--text)]/70 text-sm mb-1">Next 90 Days</p>
              <p className="text-2xl font-bold text-[var(--text)]">
                {formatCurrency(next90Days)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cash Flow Trends Chart */}
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
            Cash Flow Trends
          </h2>
          <div className="h-64">
            <Line
              ref={lineChartRef}
              data={cashFlowTrendsData}
              options={cashFlowTrendsOptions}
            />
          </div>
        </div>

        {/* Expense Categories Chart */}
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
              className="text-yellow-500"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              <path d="M2 12h20" />
            </svg>
            Expense Categories
          </h2>
          <div className="h-64">
            <Doughnut
              ref={doughnutChartRef}
              data={expenseCategoriesData}
              options={expenseCategoriesOptions}
            />
          </div>
        </div>
      </div>

      {/* Target Progress Section */}
      <div className="mt-8">
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
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            Monthly Target Progress
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative h-64">
              <Doughnut data={gaugeData} options={gaugeOptions} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-3xl font-bold text-[var(--text)]">
                  {formatCurrency(currentBalance)}
                </p>
                <p className="text-sm text-[var(--text)]/70">
                  of {formatCurrency(100000)} target
                </p>
                <p className="text-sm text-[var(--text)]/70 mt-2">
                  {((currentBalance / 100000) * 100).toFixed(1)}% achieved
                </p>
              </div>
            </div>
            <div className="flex flex-col justify-center space-y-4">
              <div className="bg-[var(--background)] rounded-lg p-4">
                <p className="text-[var(--text)]/70 text-sm mb-1">
                  Target Amount
                </p>
                <p className="text-2xl font-bold text-[var(--text)]">
                  {formatCurrency(100000)}
                </p>
              </div>
              <div className="bg-[var(--background)] rounded-lg p-4">
                <p className="text-[var(--text)]/70 text-sm mb-1">Remaining</p>
                <p className="text-2xl font-bold text-[var(--text)]">
                  {formatCurrency(Math.max(0, 100000 - currentBalance))}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions Section */}
      <div className="mt-8">
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
              <path d="M12 8v4l3 3" />
              <circle cx="12" cy="12" r="10" />
            </svg>
            Recent Transactions
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-[var(--border)]">
                  <th className="pb-3 text-[var(--text)]/70 font-medium">
                    Date
                  </th>
                  <th className="pb-3 text-[var(--text)]/70 font-medium">
                    Description
                  </th>
                  <th className="pb-3 text-[var(--text)]/70 font-medium">
                    Amount
                  </th>
                  <th className="pb-3 text-[var(--text)]/70 font-medium">
                    Type
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[var(--border)] last:border-0">
                  <td className="py-3 text-[var(--text)]">No transactions</td>
                  <td className="py-3 text-[var(--text)]">-</td>
                  <td className="py-3 text-[var(--text)]">-</td>
                  <td className="py-3 text-[var(--text)]">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
