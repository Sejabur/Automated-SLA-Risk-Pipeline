"use client";

import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useState } from "react";

export function ExportPdfButton({ vendors = [], userEmail }: { vendors: any[], userEmail?: string }) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    let aiSummary = "No AI Summary generated.";

    try {
      const res = await fetch("/api/ai-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendors }),
      });
      const data = await res.json();
      if (data.summary) {
        aiSummary = data.summary;
      }
    } catch (e) {
      console.error(e);
      aiSummary = "Error generating AI summary.";
    }

    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(231, 98, 87); // #E76257 (Coral)
    doc.text("Report", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // slate-500
    const now = new Date();
    doc.text(`Generated on ${now.toLocaleDateString()} at ${now.toLocaleTimeString()} by ${userEmail || 'Unknown'}`, 14, 30);

    // Summary Stats
    const highRisk = vendors.filter(v => (v.calculated_risk_score || 0) > 6).length;
    const avgSla = vendors.length > 0 ? (vendors.reduce((acc, curr) => acc + Number(curr.sla_uptime_promise || 0), 0) / vendors.length).toFixed(2) : '0';
    
    doc.setFontSize(14);
    doc.setTextColor(231, 98, 87);
    doc.text("System Overview", 14, 45);
    doc.setDrawColor(231, 98, 87);
    doc.line(14, 46, 55, 46); // Underline
    
    doc.setFontSize(11);
    doc.setTextColor(28, 36, 57); // Dark navy for regular text
    doc.text(`Total Monitored Vendors: ${vendors.length}`, 14, 55);
    doc.text(`High Risk Vendors (Score > 6): ${highRisk}`, 14, 62);
    doc.text(`Average SLA Uptime: ${avgSla}%`, 14, 69);

    // Table Data
    doc.setFontSize(14);
    doc.setTextColor(231, 98, 87);
    doc.text("Vendor Risk Breakdown", 14, 85);
    doc.line(14, 86, 70, 86); // Underline

    const vendorsNeedingAttention = vendors.filter(v => 
      (v.calculated_risk_score || 0) > 6 || 
      (v.actual_sla !== null && v.actual_sla < v.sla_uptime_promise)
    );

    const tableData = vendorsNeedingAttention.map(v => [
      v.name,
      v.category,
      v.sla_uptime_promise ? `${v.sla_uptime_promise}%` : 'N/A',
      v.actual_sla ? `${v.actual_sla}%` : 'N/A',
      v.calculated_risk_score?.toString() || '0'
    ]);
    
    if (tableData.length === 0) {
      tableData.push(["No high risk vendors found", "-", "-", "-", "-"]);
    }

    autoTable(doc, {
      startY: 90,
      head: [['Vendor Name', 'Category', 'SLA Target', 'Actual SLA', 'Risk Score']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [231, 98, 87] }, // #E76257
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    // AI Summary Section on a new page
    doc.addPage();
    doc.setFontSize(14);
    doc.setTextColor(231, 98, 87);
    doc.text("AI Executive Conclusion", 14, 22);
    doc.line(14, 23, 65, 23);

    doc.setFontSize(11);
    doc.setTextColor(28, 36, 57);
    
    // Split text so it wraps
    const splitTitle = doc.splitTextToSize(aiSummary, 180);
    doc.text(splitTitle, 14, 33);
    
    // Add AI Warning
    const finalY2 = 33 + (splitTitle.length * 5) + 5;
    doc.setFontSize(9);
    doc.setTextColor(217, 119, 6); // amber-600
    doc.text("Warning: AI can make mistakes. Always double check before taking major decisions.", 14, finalY2);

    doc.save("SLA_Risk_Report.pdf");
    setLoading(false);
  };

  return (
    <Button 
      onClick={handleExport}
      disabled={loading}
      variant="outline" 
      className="border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm h-9 px-4 font-medium transition-colors rounded-md"
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Download className="w-3.5 h-3.5 mr-2" />}
      {loading ? "Generating..." : "Export Report"}
    </Button>
  );
}
