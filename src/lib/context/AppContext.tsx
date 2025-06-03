"use client";

import React, { createContext, useContext } from "react";
import { AppContextType } from "../types";
import { useCashFlow } from "./CashFlowContext";
import { useInventory } from "./InventoryContext";

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const cashFlow = useCashFlow();
  const inventory = useInventory();

  const value: AppContextType = {
    cashFlow,
    inventory,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
