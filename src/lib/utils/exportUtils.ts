import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface ExportData {
  [key: string]: string | number;
}

export const exportToPDF = (data: ExportData[], filename: string) => {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(16);
  doc.text(filename.split("-").join(" ").toUpperCase(), 14, 15);

  // Add date
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 25);

  // Add table
  const tableColumn = Object.keys(data[0]);
  const tableRows = data.map((item) => Object.values(item));

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 35,
    theme: "grid",
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [66, 139, 202],
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });

  // Save the PDF
  doc.save(`${filename}.pdf`);
};
