import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface PdfExportOptions {
  title: string;
  period: string;
  columns: string[];
  rows: (string | number)[][];
  filename: string;
}

export function exportToPdf({
  title,
  period,
  columns,
  rows,
  filename,
}: PdfExportOptions) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("CoffeeStock", 14, 20);
  doc.setFontSize(12);
  doc.text(title, 14, 30);
  doc.setFontSize(10);
  doc.text(`Periode: ${period}`, 14, 38);
  doc.text(`Dicetak: ${new Date().toLocaleDateString("id-ID")}`, 14, 44);

  autoTable(doc, {
    head: [columns],
    body: rows,
    startY: 50,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [120, 80, 40] },
  });

  doc.save(`${filename}.pdf`);
}
