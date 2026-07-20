import { ShieldCheck } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { getUserRole } from "@/utils/roles";
import { ExportAuditLogsButton } from "@/components/ExportAuditLogsButton";
import { redirect } from "next/navigation";

export default async function ActivityPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userEmail = user?.email;
  
  if (!userEmail) return null;

  const role = await getUserRole(userEmail);
  if (role !== "admin") {
    redirect("/");
  }

  let auditLogs: any[] = [];
  try {
    const { data: logsData } = await supabase.from('audit_logs').select('*').order('timestamp', { ascending: false });
    if (logsData) auditLogs = logsData;
  } catch (e) {}

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-heading text-[#1C2439] tracking-tight">Activity Log</h1>
      </div>
      
      <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm font-semibold text-[#1C2439]">System Audit Logs</h2>
          </div>
          <ExportAuditLogsButton logs={auditLogs} />
        </div>
        <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-slate-50 border-b border-slate-200 sticky top-0">
              <tr>
                <th className="px-6 py-3 font-medium">Timestamp</th>
                <th className="px-6 py-3 font-medium">Action</th>
                <th className="px-6 py-3 font-medium">User</th>
                <th className="px-6 py-3 font-medium">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="px-6 py-4 font-medium text-[#1C2439]">{log.action}</td>
                  <td className="px-6 py-4 text-slate-600">{log.user}</td>
                  <td className="px-6 py-4 text-slate-500">{log.details}</td>
                </tr>
              ))}
              {auditLogs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    No activity logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
