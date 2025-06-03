import {
  FinancialMetrics,
  InventoryMetrics,
  SalesMetrics,
} from "@/types/reports";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ExportOptions {
  financialMetrics: FinancialMetrics;
  salesMetrics: SalesMetrics;
  inventoryMetrics: InventoryMetrics;
  lowStockItems: Array<{
    name: string;
    category: string;
    currentStock: number;
    reorderLevel: number;
  }>;
}

export const exportToPDF = ({
  financialMetrics,
  salesMetrics,
  inventoryMetrics,
  lowStockItems,
}: ExportOptions) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = 20;

  // Add title
  doc.setFontSize(20);
  doc.text("Business Report", pageWidth / 2, yPos, { align: "center" });
  yPos += 20;

  // Add date
  doc.setFontSize(12);
  doc.text(
    `Generated on: ${new Date().toLocaleDateString()}`,
    pageWidth / 2,
    yPos,
    {
      align: "center",
    }
  );
  yPos += 20;

  // Financial Overview
  doc.setFontSize(16);
  doc.text("Financial Overview", margin, yPos);
  yPos += 10;

  const financialData = [
    ["Total Sales", formatCurrency(financialMetrics.totalSales)],
    ["Total Expenses", formatCurrency(financialMetrics.totalExpenses)],
    ["Net Cash Flow", formatCurrency(financialMetrics.netCashFlow)],
    ["Inventory Value", formatCurrency(financialMetrics.inventoryValue)],
    ["Total Assets", formatCurrency(financialMetrics.totalAssets)],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [["Metric", "Value"]],
    body: financialData,
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185] },
    margin: { left: margin },
  });

  yPos = (doc as any).lastAutoTable.finalY + 20;

  // Sales Performance
  doc.setFontSize(16);
  doc.text("Sales Performance", margin, yPos);
  yPos += 10;

  const salesData = [
    ["Daily Average", formatCurrency(salesMetrics.dailyAverage)],
    ["Highest Sale", formatCurrency(salesMetrics.highestSale)],
    ["Lowest Sale", formatCurrency(salesMetrics.lowestSale)],
    ["Total Transactions", salesMetrics.totalTransactions.toString()],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [["Metric", "Value"]],
    body: salesData,
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185] },
    margin: { left: margin },
  });

  yPos = (doc as any).lastAutoTable.finalY + 20;

  // Inventory Analysis
  doc.setFontSize(16);
  doc.text("Inventory Analysis", margin, yPos);
  yPos += 10;

  const inventoryData = [
    ["Total Items", inventoryMetrics.totalItems.toString()],
    ["Low Stock Items", inventoryMetrics.lowStockItems.toString()],
    ["Total Value", formatCurrency(inventoryMetrics.totalValue)],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [["Metric", "Value"]],
    body: inventoryData,
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185] },
    margin: { left: margin },
  });

  yPos = (doc as any).lastAutoTable.finalY + 20;

  // Categories Breakdown
  doc.setFontSize(16);
  doc.text("Categories Breakdown", margin, yPos);
  yPos += 10;

  const categoriesData = Object.entries(inventoryMetrics.categories).map(
    ([category, count]) => [category, `${count} items`]
  );

  autoTable(doc, {
    startY: yPos,
    head: [["Category", "Count"]],
    body: categoriesData,
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185] },
    margin: { left: margin },
  });

  yPos = (doc as any).lastAutoTable.finalY + 20;

  // Low Stock Items
  if (lowStockItems.length > 0) {
    doc.setFontSize(16);
    doc.text("Low Stock Alerts", margin, yPos);
    yPos += 10;

    const lowStockData = lowStockItems.map((item) => [
      item.name,
      item.category,
      item.currentStock.toString(),
      item.reorderLevel.toString(),
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [["Item", "Category", "Current Stock", "Reorder Level"]],
      body: lowStockData,
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185] },
      margin: { left: margin },
    });
  }

  // Save the PDF
  doc.save("business-report.pdf");
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};
