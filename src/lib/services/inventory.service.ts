import inventoryData from "../data/inventory_data.json";
import { InventoryItem, StockLevel } from "../types";

export class InventoryService {
  static async addItem(item: InventoryItem): Promise<InventoryItem> {
    const response = await fetch("/api/db", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "addInventoryItem",
        data: item,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to add inventory item");
    }

    return data.data;
  }

  static async updateStockLevel(
    itemId: string,
    newLevel: number
  ): Promise<StockLevel> {
    const response = await fetch("/api/db", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "updateStockLevel",
        data: { itemId, newLevel },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to update stock level");
    }

    return data.data;
  }

  static async getItemById(itemId: string): Promise<InventoryItem | null> {
    const item = inventoryData.inventory_items.find(
      (item) => item.item_id === itemId
    );
    return item || null;
  }

  static async getStockLevel(itemId: string): Promise<StockLevel | null> {
    const stock = inventoryData.stock_levels.find(
      (stock) => stock.item_id === itemId
    );
    return stock || null;
  }

  static async getItemsByCategory(category: string): Promise<InventoryItem[]> {
    return inventoryData.inventory_items.filter(
      (item) => item.category === category
    );
  }

  static async getLowStockItems(): Promise<
    { item: InventoryItem; stock: StockLevel }[]
  > {
    return inventoryData.inventory_items
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
        (item): item is { item: InventoryItem; stock: StockLevel } =>
          item !== null
      );
  }

  static async getTotalInventoryValue(): Promise<number> {
    return inventoryData.inventory_items.reduce((total, item) => {
      const stock = inventoryData.stock_levels.find(
        (level) => level.item_id === item.item_id
      );
      return total + item.price * (stock?.stock_level || 0);
    }, 0);
  }
}
