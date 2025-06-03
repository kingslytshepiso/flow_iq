export interface Sale {
  date: string;
  amount: number;
  description: string;
}

export interface Expense {
  date: string;
  amount: number;
  description: string;
}

export interface CashFlowData {
  sales: Sale[];
  expenses: Expense[];
}

export interface InventoryItem {
  item_id: string;
  name: string;
  category: string;
  price: number;
}

export interface StockLevel {
  item_id: string;
  stock_level: number;
  reorder_level: number;
}

export interface InventoryData {
  inventory_items: InventoryItem[];
  stock_levels: StockLevel[];
}

export interface CashFlowContextType {
  data: CashFlowData;
  loading: boolean;
  error: string | null;
  addSale: (sale: Sale) => Promise<void>;
  addExpense: (expense: Expense) => Promise<void>;
  getSalesByDateRange: (startDate: string, endDate: string) => Promise<Sale[]>;
  getExpensesByDateRange: (
    startDate: string,
    endDate: string
  ) => Promise<Expense[]>;
  getTotalSales: (startDate?: string, endDate?: string) => Promise<number>;
  getTotalExpenses: (startDate?: string, endDate?: string) => Promise<number>;
  getNetCashFlow: (startDate?: string, endDate?: string) => Promise<number>;
}

export interface InventoryContextType {
  data: InventoryData;
  loading: boolean;
  error: string | null;
  addItem: (item: InventoryItem) => Promise<void>;
  updateStockLevel: (itemId: string, newLevel: number) => Promise<void>;
  getItemById: (itemId: string) => Promise<InventoryItem | null>;
  getStockLevel: (itemId: string) => Promise<StockLevel | null>;
  getItemsByCategory: (category: string) => Promise<InventoryItem[]>;
  getLowStockItems: () => Promise<{ item: InventoryItem; stock: StockLevel }[]>;
  getTotalInventoryValue: () => Promise<number>;
}

export interface AppContextType {
  cashFlow: CashFlowContextType;
  inventory: InventoryContextType;
}
