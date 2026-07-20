"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function ExportAuditLogsButton({ logs = [] }: { logs: any[] }) {
  const handleExportCSV = () => {
    if (!logs || logs.length === 0) return;
    const headers = ["ID", "Timestamp", "Action", "User", "Details"];
    const csvContent = [
      headers.join(","),
      ...logs.map(l => `${l.id},"${l.timestamp}","${l.action}","${l.user}","${l.details}"`)
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "audit_logs_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button 
      onClick={handleExportCSV} 
      variant="outline" 
      size="sm"
      className="border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm h-8 px-3 font-medium transition-colors rounded-md text-xs"
    >
      <Download className="w-3.5 h-3.5 mr-2" />
      Export CSV
    </Button>
  );
}
