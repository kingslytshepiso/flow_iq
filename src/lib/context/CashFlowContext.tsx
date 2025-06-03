"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import cashFlowData from "../data/cash_flow_data.json";
import { CashFlowService } from "../services/cashflow.service";
import { CashFlowContextType, CashFlowData, Expense, Sale } from "../types";

const CashFlowContext = createContext<CashFlowContextType | undefined>(
  undefined
);

export function CashFlowProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<CashFlowData>(cashFlowData as CashFlowData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [sales, expenses] = await Promise.all([
          CashFlowService.getSalesByDateRange("2025-01-01", "2025-12-31"),
          CashFlowService.getExpensesByDateRange("2025-01-01", "2025-12-31"),
        ]);
        setData({ sales, expenses });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
        // Fallback to local data if API fails
        setData(cashFlowData as CashFlowData);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const addSale = async (sale: Sale) => {
    try {
      setLoading(true);
      const newSale = await CashFlowService.addSale(sale);
      setData((prev) => ({
        ...prev,
        sales: [newSale, ...prev.sales],
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add sale");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (expense: Expense) => {
    try {
      setLoading(true);
      const newExpense = await CashFlowService.addExpense(expense);
      setData((prev) => ({
        ...prev,
        expenses: [newExpense, ...prev.expenses],
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add expense");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getSalesByDateRange = async (startDate: string, endDate: string) => {
    try {
      setLoading(true);
      const sales = await CashFlowService.getSalesByDateRange(
        startDate,
        endDate
      );
      return sales;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get sales");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getExpensesByDateRange = async (startDate: string, endDate: string) => {
    try {
      setLoading(true);
      const expenses = await CashFlowService.getExpensesByDateRange(
        startDate,
        endDate
      );
      return expenses;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get expenses");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getTotalSales = async (startDate?: string, endDate?: string) => {
    try {
      setLoading(true);
      return await CashFlowService.getTotalSales(startDate, endDate);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to get total sales"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getTotalExpenses = async (startDate?: string, endDate?: string) => {
    try {
      setLoading(true);
      return await CashFlowService.getTotalExpenses(startDate, endDate);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to get total expenses"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getNetCashFlow = async (startDate?: string, endDate?: string) => {
    try {
      setLoading(true);
      const [totalSales, totalExpenses] = await Promise.all([
        getTotalSales(startDate, endDate),
        getTotalExpenses(startDate, endDate),
      ]);
      return totalSales - totalExpenses;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to get net cash flow"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value: CashFlowContextType = {
    data,
    loading,
    error,
    addSale,
    addExpense,
    getSalesByDateRange,
    getExpensesByDateRange,
    getTotalSales,
    getTotalExpenses,
    getNetCashFlow,
  };

  return (
    <CashFlowContext.Provider value={value}>
      {children}
    </CashFlowContext.Provider>
  );
}

export function useCashFlow() {
  const context = useContext(CashFlowContext);
  if (context === undefined) {
    throw new Error("useCashFlow must be used within a CashFlowProvider");
  }
  return context;
}
