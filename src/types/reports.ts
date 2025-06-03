export interface FinancialMetrics {
  totalSales: number;
  totalExpenses: number;
  netCashFlow: number;
  inventoryValue: number;
  totalAssets: number;
}

export interface SalesMetrics {
  dailyAverage: number;
  highestSale: number;
  lowestSale: number;
  totalTransactions: number;
}

export interface InventoryMetrics {
  totalItems: number;
  lowStockItems: number;
  categories: { [key: string]: number };
  totalValue: number;
}
