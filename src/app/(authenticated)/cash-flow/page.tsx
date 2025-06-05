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

// Add interfaces for type safety
interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category?: string;
}

interface CashFlowState {
  currentBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  next30Days: number;
  next90Days: number;
  transactions: Transaction[];
}

// Add new interfaces for the modal
interface TransactionFormData {
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category?: string;
}

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
  const [cashFlowState, setCashFlowState] = useState<CashFlowState>({
    currentBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    next30Days: 0,
    next90Days: 0,
    transactions: [],
  });
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [formData, setFormData] = useState<TransactionFormData>({
    date: new Date().toISOString().split("T")[0],
    description: "",
    amount: 0,
    type: "income",
    category: "",
  });

  // Chart refs with proper typing
  const lineChartRef = useRef<ChartJS<"line">>(null);
  const doughnutChartRef = useRef<ChartJS<"doughnut">>(null);

  // Function to add a new transaction
  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
    };

    setCashFlowState((prev) => {
      const newTransactions = [...prev.transactions, newTransaction];
      return calculateCashFlowState(newTransactions);
    });

    // Update charts
    updateCharts();
  };

  // Function to remove a transaction
  const removeTransaction = (transactionId: string) => {
    setCashFlowState((prev) => {
      const newTransactions = prev.transactions.filter(
        (t) => t.id !== transactionId
      );
      return calculateCashFlowState(newTransactions);
    });

    // Update charts
    updateCharts();
  };

  // Function to update a transaction
  const updateTransaction = (
    transactionId: string,
    updates: Partial<Transaction>
  ) => {
    setCashFlowState((prev) => {
      const newTransactions = prev.transactions.map((t) =>
        t.id === transactionId ? { ...t, ...updates } : t
      );
      return calculateCashFlowState(newTransactions);
    });

    // Update charts
    updateCharts();
  };

  // Function to calculate cash flow state from transactions
  const calculateCashFlowState = (
    transactions: Transaction[]
  ): CashFlowState => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
    const ninetyDaysAgo = new Date(now.setDate(now.getDate() - 60));

    // Calculate totals
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate monthly totals
    const monthlyIncome = transactions
      .filter(
        (t) =>
          t.type === "income" &&
          new Date(t.date) >= thirtyDaysAgo &&
          new Date(t.date) <= new Date()
      )
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpenses = transactions
      .filter(
        (t) =>
          t.type === "expense" &&
          new Date(t.date) >= thirtyDaysAgo &&
          new Date(t.date) <= new Date()
      )
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate forecasts
    const averageMonthlyNet = (totalIncome - totalExpenses) / 3; // Assuming 3 months of data
    const next30Days = averageMonthlyNet;
    const next90Days = averageMonthlyNet * 3;

    return {
      currentBalance: totalIncome - totalExpenses,
      monthlyIncome,
      monthlyExpenses,
      next30Days,
      next90Days,
      transactions,
    };
  };

  // Function to update chart data
  const updateCharts = () => {
    if (lineChartRef.current) {
      const chart = lineChartRef.current;
      const transactions = cashFlowState.transactions;

      // Update line chart data
      const dates = Array.from(new Set(transactions.map((t) => t.date))).sort();
      const incomeData = dates.map((date) =>
        transactions
          .filter((t) => t.date === date && t.type === "income")
          .reduce((sum, t) => sum + t.amount, 0)
      );
      const expenseData = dates.map((date) =>
        transactions
          .filter((t) => t.date === date && t.type === "expense")
          .reduce((sum, t) => sum + t.amount, 0)
      );

      chart.data.labels = dates;
      chart.data.datasets[0].data = incomeData;
      chart.data.datasets[1].data = expenseData;
      chart.update();
    }

    if (doughnutChartRef.current) {
      const chart = doughnutChartRef.current;
      const transactions = cashFlowState.transactions;

      // Update doughnut chart data
      const categories = Array.from(
        new Set(
          transactions
            .filter((t) => t.type === "expense")
            .map((t) => t.category || "Uncategorized")
        )
      );
      const categoryData = categories.map((category) =>
        transactions
          .filter(
            (t) =>
              t.type === "expense" &&
              (t.category || "Uncategorized") === category
          )
          .reduce((sum, t) => sum + t.amount, 0)
      );

      chart.data.labels = categories;
      chart.data.datasets[0].data = categoryData;
      chart.update();
    }
  };

  // Function to handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingTransaction) {
      updateTransaction(editingTransaction.id, formData);
    } else {
      addTransaction(formData);
    }

    // Reset form and close modal
    setFormData({
      date: new Date().toISOString().split("T")[0],
      description: "",
      amount: 0,
      type: "income",
      category: "",
    });
    setEditingTransaction(null);
    setIsModalOpen(false);
  };

  // Function to handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "amount" ? parseFloat(value) || 0 : value,
    }));
  };

  // Function to open modal for editing
  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      date: transaction.date,
      description: transaction.description,
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category || "",
    });
    setIsModalOpen(true);
  };

  // Function to handle transaction deletion
  const handleDelete = (transactionId: string) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      removeTransaction(transactionId);
    }
  };

  // Save transactions to localStorage
  useEffect(() => {
    if (cashFlowState.transactions.length > 0) {
      localStorage.setItem(
        "cashFlowTransactions",
        JSON.stringify(cashFlowState.transactions)
      );
    }
  }, [cashFlowState.transactions]);

  // Load transactions from localStorage on initial load
  useEffect(() => {
    const savedTransactions = localStorage.getItem("cashFlowTransactions");
    if (savedTransactions) {
      const parsedTransactions = JSON.parse(savedTransactions) as Transaction[];
      setCashFlowState(calculateCashFlowState(parsedTransactions));
    } else {
      // Initialize with cash flow data if no saved transactions
      const initialTransactions: Transaction[] = [
        ...cashFlowData.sales.map((sale) => ({
          id: crypto.randomUUID(),
          date: sale.date,
          description: sale.description,
          amount: sale.amount,
          type: "income" as const,
        })),
        ...cashFlowData.expenses.map((expense) => ({
          id: crypto.randomUUID(),
          date: expense.date,
          description: expense.description,
          amount: expense.amount,
          type: "expense" as const,
          category: expense.description.split(" - ")[0],
        })),
      ];
      setCashFlowState(calculateCashFlowState(initialTransactions));
    }
  }, []);

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
    labels: cashFlowState.transactions.map((t) => t.date),
    datasets: [
      {
        label: "Income",
        data: cashFlowState.transactions
          .filter((t) => t.type === "income")
          .map((t) => t.amount),
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.5)",
        tension: 0.4,
      },
      {
        label: "Expenses",
        data: cashFlowState.transactions
          .filter((t) => t.type === "expense")
          .map((t) => t.amount),
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
  const expenseCategories = cashFlowState.transactions
    .filter((t) => t.type === "expense")
    .reduce((acc: any, expense) => {
      const category = expense.category || "Uncategorized";
      acc[category] = (acc[category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

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
        data: [
          cashFlowState.currentBalance,
          100000 - cashFlowState.currentBalance,
        ], // Current balance vs remaining to target
        backgroundColor: [
          cashFlowState.currentBalance >= 100000
            ? "rgb(34, 197, 94)"
            : "rgb(239, 68, 68)", // Green if target reached, red if not
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
    <div className="min-h-screen p-6">
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
                {formatCurrency(cashFlowState.currentBalance)}
              </p>
            </div>
            <div className="bg-[var(--background)] rounded-lg p-4">
              <p className="text-[var(--text)]/70 text-sm mb-1">
                Monthly Income
              </p>
              <p className="text-2xl font-bold text-[var(--text)]">
                {formatCurrency(cashFlowState.monthlyIncome)}
              </p>
            </div>
            <div className="bg-[var(--background)] rounded-lg p-4">
              <p className="text-[var(--text)]/70 text-sm mb-1">
                Monthly Expenses
              </p>
              <p className="text-2xl font-bold text-[var(--text)]">
                {formatCurrency(cashFlowState.monthlyExpenses)}
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
                {formatCurrency(cashFlowState.next30Days)}
              </p>
            </div>
            <div className="bg-[var(--background)] rounded-lg p-4">
              <p className="text-[var(--text)]/70 text-sm mb-1">Next 90 Days</p>
              <p className="text-2xl font-bold text-[var(--text)]">
                {formatCurrency(cashFlowState.next90Days)}
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
                  {formatCurrency(cashFlowState.currentBalance)}
                </p>
                <p className="text-sm text-[var(--text)]/70">
                  of {formatCurrency(100000)} target
                </p>
                <p className="text-sm text-[var(--text)]/70 mt-2">
                  {((cashFlowState.currentBalance / 100000) * 100).toFixed(1)}%
                  achieved
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
                  {formatCurrency(
                    Math.max(0, 100000 - cashFlowState.currentBalance)
                  )}
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
                  <th className="pb-3 text-[var(--text)]/70 font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {cashFlowState.transactions.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-[var(--border)] last:border-0"
                  >
                    <td className="py-3 text-[var(--text)]">{t.date}</td>
                    <td className="py-3 text-[var(--text)]">{t.description}</td>
                    <td className="py-3 text-[var(--text)]">
                      {formatCurrency(t.amount)}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          t.type === "income"
                            ? "bg-green-100/20 text-green-500 border border-green-500/20"
                            : "bg-red-100/20 text-red-500 border border-red-500/20"
                        }`}
                      >
                        {t.type === "income" ? "Income" : "Expense"}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(t)}
                          className="p-1 text-[var(--text)]/70 hover:text-[var(--text)] transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="p-1 text-red-500/70 hover:text-red-500 transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[var(--card)] rounded-xl shadow-lg p-6 w-full max-w-md border border-[var(--border)]">
            <h2 className="text-xl font-semibold text-[var(--text)] mb-6">
              {editingTransaction ? "Edit Transaction" : "Add Transaction"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text)]/70 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--text)]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text)]/70 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--text)]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text)]/70 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--text)]"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text)]/70 mb-1">
                  Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--text)]"
                  required
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              {formData.type === "expense" && (
                <div>
                  <label className="block text-sm font-medium text-[var(--text)]/70 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--text)]"
                    placeholder="e.g., Utilities, Rent, Supplies"
                  />
                </div>
              )}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingTransaction(null);
                    setFormData({
                      date: new Date().toISOString().split("T")[0],
                      description: "",
                      amount: 0,
                      type: "income",
                      category: "",
                    });
                  }}
                  className="px-4 py-2 text-[var(--text)]/70 hover:text-[var(--text)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingTransaction ? "Update" : "Add"} Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Add Transaction Button */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        >
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
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>
    </div>
  );
}
