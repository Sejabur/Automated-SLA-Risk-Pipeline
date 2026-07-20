"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function ExportVendorsButton({ vendors = [] }: { vendors: any[] }) {
  const handleExportCSV = () => {
    if (!vendors || vendors.length === 0) return;
    const headers = ["Vendor Name", "Category", "Risk Score", "SLA Target", "Actual SLA"];
    const csvContent = [
      headers.join(","),
      ...vendors.map(v => `"${v.name}","${v.category}",${v.calculated_risk_score || 0},${v.sla_uptime_promise || 0},${v.actual_sla ?? v.sla_uptime_promise}`)
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "vendors_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button 
      onClick={handleExportCSV} 
      variant="outline" 
      className="border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm h-9 px-4 font-medium transition-colors rounded-md"
    >
      <Download className="w-3.5 h-3.5 mr-2" />
      Export List
    </Button>
  );
}
