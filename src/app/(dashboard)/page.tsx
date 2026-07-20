import { AlertTriangle, ShieldCheck, Activity } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { DashboardCharts } from "@/components/DashboardCharts";
import { ExportPdfButton } from "@/components/ExportPdfButton";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userEmail = user?.email || "Unknown User";
  
  let vendors: any[] = [];
  try {
    const { data, error } = await supabase.from('vendors').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      vendors = data;
    }
  } catch (e) {
    // Ignore error
  }

  const highRiskCount = vendors.filter(v => (v.calculated_risk_score || 0) > 6).length;
  const avgSla = vendors.length > 0 ? (vendors.reduce((acc, curr) => acc + Number(curr.actual_sla ?? curr.sla_uptime_promise ?? 0), 0) / vendors.length).toFixed(2) : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-[#1C2439] tracking-tight">Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <ExportPdfButton vendors={vendors} userEmail={userEmail} />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        <div className="bg-white p-5 border border-slate-200 rounded-md shadow-sm flex flex-col h-full">
          <div className="flex items-start justify-between gap-2 mb-4">
            <h3 className="font-medium text-slate-500 text-sm leading-snug">Total Vendors</h3>
            <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          </div>
          <p className="text-3xl font-bold text-[#1C2439] tracking-tight mt-auto">{vendors.length}</p>
        </div>
        
        <div className="bg-white p-5 border border-slate-200 rounded-md shadow-sm flex flex-col h-full">
          <div className="flex items-start justify-between gap-2 mb-4">
            <h3 className="font-medium text-slate-500 text-sm leading-snug">High Risk</h3>
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          </div>
          <p className="text-3xl font-bold text-[#1C2439] tracking-tight mt-auto">{highRiskCount}</p>
        </div>

        <div className="bg-white p-5 border border-slate-200 rounded-md shadow-sm flex flex-col h-full">
          <div className="flex items-start justify-between gap-2 mb-4">
            <h3 className="font-medium text-slate-500 text-sm leading-snug">Average SLA</h3>
            <Activity className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          </div>
          <p className="text-3xl font-bold text-[#1C2439] tracking-tight mt-auto">{avgSla}%</p>
        </div>
      </div>

      {/* Analytics Section */}
      <DashboardCharts vendors={vendors} />
    </div>
  );
}
