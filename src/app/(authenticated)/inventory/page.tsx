"use client";

import { useAuth } from "@/lib/auth/AuthContext";
import inventoryData from "@/lib/data/inventory_data.json";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { exportToPDF } from "@/lib/utils/exportUtils";
import { useEffect, useState } from "react";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
  reorderLevel: number;
  lastRestocked: string;
}

interface DialogState {
  isOpen: boolean;
  type: "add" | "edit" | "delete" | null;
  item?: InventoryItem;
}

export default function InventoryPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortField, setSortField] = useState<keyof InventoryItem>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [dialog, setDialog] = useState<DialogState>({
    isOpen: false,
    type: null,
  });
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    name: "",
    category: "",
    quantity: 0,
    price: 0,
    reorderLevel: 0,
  });

  useEffect(() => {
    // Load and transform inventory data
    const transformedInventory = inventoryData.inventory_items.map((item) => {
      const stockLevel = inventoryData.stock_levels.find(
        (stock) => stock.item_id === item.item_id
      );
      const lastOrder = inventoryData.order_history
        .filter((order) => order.item_id === item.item_id)
        .sort(
          (a, b) =>
            new Date(b.order_date).getTime() - new Date(a.order_date).getTime()
        )[0];

      return {
        id: item.item_id,
        name: item.name,
        category: item.category,
        quantity: stockLevel?.stock_level || 0,
        price: item.price,
        reorderLevel: stockLevel?.reorder_level || 0,
        lastRestocked: lastOrder?.order_date || new Date().toISOString(),
      };
    });

    setInventory(transformedInventory);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const categories = [
    "all",
    ...new Set(inventory.map((item) => item.category)),
  ];

  const filteredInventory = inventory
    .filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const direction = sortDirection === "asc" ? 1 : -1;

      if (typeof aValue === "string" && typeof bValue === "string") {
        return aValue.localeCompare(bValue) * direction;
      }
      return ((aValue as number) - (bValue as number)) * direction;
    });

  const handleSort = (field: keyof InventoryItem) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity <= 0) {
      return {
        text: "Out of Stock",
        color: "text-red-500",
        bg: "bg-red-100",
      };
    }
    if (item.quantity <= item.reorderLevel) {
      return {
        text: "Low Stock",
        color: "text-yellow-500",
        bg: "bg-yellow-100",
      };
    }
    return {
      text: "In Stock",
      color: "text-green-500",
      bg: "bg-green-100",
    };
  };

  const handleAddItem = () => {
    setFormData({
      name: "",
      category: "",
      quantity: 0,
      price: 0,
      reorderLevel: 0,
    });
    setDialog({ isOpen: true, type: "add" });
  };

  const handleEditItem = (item: InventoryItem) => {
    setFormData(item);
    setDialog({ isOpen: true, type: "edit", item });
  };

  const handleDeleteItem = (item: InventoryItem) => {
    setDialog({ isOpen: true, type: "delete", item });
  };

  const handleExport = () => {
    const exportData = filteredInventory.map((item) => ({
      Name: item.name,
      Category: item.category,
      Quantity: item.quantity,
      Price: formatCurrency(item.price),
      "Last Restocked": formatDate(item.lastRestocked),
      Status: getStockStatus(item).text,
    }));

    exportToPDF(exportData, "inventory-report");
  };

  const handleSubmit = () => {
    if (dialog.type === "add") {
      const newItem: InventoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name || "",
        category: formData.category || "",
        quantity: formData.quantity || 0,
        price: formData.price || 0,
        reorderLevel: formData.reorderLevel || 0,
        lastRestocked: new Date().toISOString(),
      };
      setInventory([...inventory, newItem]);
    } else if (dialog.type === "edit" && dialog.item) {
      setInventory(
        inventory.map((item) =>
          item.id === dialog.item?.id
            ? {
                ...item,
                ...formData,
                lastRestocked: new Date().toISOString(),
              }
            : item
        )
      );
    } else if (dialog.type === "delete" && dialog.item) {
      setInventory(inventory.filter((item) => item.id !== dialog.item?.id));
    }
    setDialog({ isOpen: false, type: null });
  };

  return (
    <div className="min-h-screen p-6">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text)] mb-2">
          Inventory Management
        </h1>
        <p className="text-[var(--text)]/70 text-lg">
          Manage and track your inventory items
        </p>
      </div>

      {/* Filters and Search Section */}
      <div className="bg-[var(--card)] rounded-xl shadow-lg p-6 border border-[var(--border)] mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 absolute right-3 top-2.5 text-[var(--text)]/50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddItem}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add Item
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-[var(--card)] rounded-xl shadow-lg border border-[var(--border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--background)]">
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-[var(--text)]/70 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center gap-2">
                    Name
                    {sortField === "name" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-4 w-4 ${
                          sortDirection === "asc" ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-[var(--text)]/70 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("category")}
                >
                  <div className="flex items-center gap-2">
                    Category
                    {sortField === "category" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-4 w-4 ${
                          sortDirection === "asc" ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-[var(--text)]/70 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("quantity")}
                >
                  <div className="flex items-center gap-2">
                    Quantity
                    {sortField === "quantity" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-4 w-4 ${
                          sortDirection === "asc" ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-[var(--text)]/70 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("price")}
                >
                  <div className="flex items-center gap-2">
                    Price
                    {sortField === "price" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-4 w-4 ${
                          sortDirection === "asc" ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-[var(--text)]/70 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("lastRestocked")}
                >
                  <div className="flex items-center gap-2">
                    Last Restocked
                    {sortField === "lastRestocked" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-4 w-4 ${
                          sortDirection === "asc" ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text)]/70 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text)]/70 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredInventory.map((item) => {
                const status = getStockStatus(item);
                return (
                  <tr key={item.id} className="hover:bg-[var(--background)]">
                    <td className="px-6 py-4 whitespace-nowrap text-[var(--text)]">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[var(--text)]">
                      {item.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[var(--text)]">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[var(--text)]">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[var(--text)]">
                      {formatDate(item.lastRestocked)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${status.color} ${status.bg}`}
                      >
                        {status.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditItem(item)}
                        className="text-blue-500 hover:text-blue-600 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item)}
                        className="text-red-500 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialog */}
      {dialog.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--card)] rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {dialog.type === "add"
                ? "Add New Item"
                : dialog.type === "edit"
                ? "Edit Item"
                : "Delete Item"}
            </h2>

            {dialog.type === "delete" ? (
              <div>
                <p className="mb-4">
                  Are you sure you want to delete {dialog.item?.name}? This
                  action cannot be undone.
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setDialog({ isOpen: false, type: null })}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--background)]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--background)]"
                      required
                    >
                      <option value="">Select a category</option>
                      {categories
                        .filter((cat) => cat !== "all")
                        .map((category) => (
                          <option key={category} value={category}>
                            {category.charAt(0).toUpperCase() +
                              category.slice(1)}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          quantity: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--background)]"
                      required
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Price
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price: parseFloat(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--background)]"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Reorder Level
                    </label>
                    <input
                      type="number"
                      value={formData.reorderLevel}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          reorderLevel: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--background)]"
                      required
                      min="0"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    type="button"
                    onClick={() => setDialog({ isOpen: false, type: null })}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    {dialog.type === "add" ? "Add" : "Save"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
