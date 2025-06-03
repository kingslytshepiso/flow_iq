import { Expense, Sale } from "../types";

export class CashFlowService {
  static async addSale(sale: Sale): Promise<Sale> {
    const response = await fetch("/api/db", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "addSale",
        data: sale,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to add sale");
    }

    return data.data;
  }

  static async addExpense(expense: Expense): Promise<Expense> {
    const response = await fetch("/api/db", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "addExpense",
        data: expense,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to add expense");
    }

    return data.data;
  }

  static async getSalesByDateRange(
    startDate: string,
    endDate: string
  ): Promise<Sale[]> {
    const response = await fetch("/api/db", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "getSalesByDateRange",
        data: { startDate, endDate },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to get sales");
    }

    return data.data || [];
  }

  static async getExpensesByDateRange(
    startDate: string,
    endDate: string
  ): Promise<Expense[]> {
    const response = await fetch("/api/db", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "getExpensesByDateRange",
        data: { startDate, endDate },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to get expenses");
    }

    return data.data || [];
  }

  static async getTotalSales(
    startDate?: string,
    endDate?: string
  ): Promise<number> {
    const response = await fetch("/api/db", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "getTotalSales",
        data: { startDate, endDate },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to get total sales");
    }

    return data.total || 0;
  }

  static async getTotalExpenses(
    startDate?: string,
    endDate?: string
  ): Promise<number> {
    const response = await fetch("/api/db", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "getTotalExpenses",
        data: { startDate, endDate },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to get total expenses");
    }

    return data.total || 0;
  }
}
