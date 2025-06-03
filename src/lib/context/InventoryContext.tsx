"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import inventoryData from "../data/inventory_data.json";
import { InventoryService } from "../services/inventory.service";
import {
  InventoryContextType,
  InventoryData,
  InventoryItem,
  StockLevel,
} from "../types";

const InventoryContext = createContext<InventoryContextType | undefined>(
  undefined
);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<InventoryData>(
    inventoryData as InventoryData
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [items, stockLevels] = await Promise.all([
          InventoryService.getItemsByCategory("all"),
          Promise.all(
            (inventoryData as InventoryData).inventory_items.map((item) =>
              InventoryService.getStockLevel(item.item_id)
            )
          ),
        ]);
        setData({
          inventory_items: items,
          stock_levels: stockLevels.filter(
            (level): level is StockLevel => level !== null
          ),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
        // Fallback to local data if API fails
        setData(inventoryData as InventoryData);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const addItem = async (item: InventoryItem) => {
    try {
      setLoading(true);
      const newItem = await InventoryService.addItem(item);
      setData((prev) => ({
        ...prev,
        inventory_items: [...prev.inventory_items, newItem],
        stock_levels: [
          ...prev.stock_levels,
          {
            item_id: newItem.item_id,
            stock_level: 0,
            reorder_level: 10, // Default reorder level
          },
        ],
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add item");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateStockLevel = async (itemId: string, newLevel: number) => {
    try {
      setLoading(true);
      const updatedStock = await InventoryService.updateStockLevel(
        itemId,
        newLevel
      );
      setData((prev) => ({
        ...prev,
        stock_levels: prev.stock_levels.map((level) =>
          level.item_id === itemId ? updatedStock : level
        ),
      }));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update stock level"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getItemById = async (itemId: string) => {
    try {
      setLoading(true);
      return await InventoryService.getItemById(itemId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get item");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getStockLevel = async (itemId: string) => {
    try {
      setLoading(true);
      return await InventoryService.getStockLevel(itemId);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to get stock level"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getItemsByCategory = async (category: string) => {
    try {
      setLoading(true);
      return await InventoryService.getItemsByCategory(category);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to get items by category"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getLowStockItems = async () => {
    try {
      setLoading(true);
      return await InventoryService.getLowStockItems();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to get low stock items"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getTotalInventoryValue = async () => {
    try {
      setLoading(true);
      return await InventoryService.getTotalInventoryValue();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to get total inventory value"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value: InventoryContextType = {
    data,
    loading,
    error,
    addItem,
    updateStockLevel,
    getItemById,
    getStockLevel,
    getItemsByCategory,
    getLowStockItems,
    getTotalInventoryValue,
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error("useInventory must be used within an InventoryProvider");
  }
  return context;
}
