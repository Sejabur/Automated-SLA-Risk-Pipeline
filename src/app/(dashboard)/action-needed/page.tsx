import { createClient } from "@/utils/supabase/server";
import { getUserRole } from "@/utils/roles";
import { redirect } from "next/navigation";
import { ShieldAlert, CheckCircle2, UserPlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { markDeletionRequestCompleted } from "@/app/actions/vendors";
import { promoteUser, denyRequest } from "@/app/actions/users";
import { ActionNeededClient } from "@/components/ActionNeededClient";

export default async function ActionNeededPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const role = await getUserRole(user?.email);

  if (role !== "admin") {
    redirect("/");
  }

  let pendingUsers: any[] = [];
  try {
    const { data } = await supabase
      .from('profiles')
      .select('*').eq('role', 'pending').order('created_at', { ascending: false });
    if (data) pendingUsers = data;
  } catch (e) {}

  let deletionRequests: any[] = [];
  try {
    const { data } = await supabase.from('audit_logs')
      .select('*')
      .in('action', ['Deletion Request', 'Deletion Request [COMPLETED]'])
      .order('timestamp', { ascending: false });
    if (data) deletionRequests = data;
  } catch (e) {}

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-[#1C2439] tracking-tight">Action Needed</h1>
          <p className="text-sm text-slate-500 mt-1">Review pending operator requests and new user approvals.</p>
        </div>
      </div>

      <ActionNeededClient 
        initialPendingUsers={pendingUsers} 
        initialDeletionRequests={deletionRequests} 
      />
    </div>
  );
}
