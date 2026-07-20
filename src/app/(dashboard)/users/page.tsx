import { Users } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { getUserRole } from "@/utils/roles";
import { UserActionButtons } from "@/components/UserActionButtons";
import { redirect } from "next/navigation";

export default async function UsersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userEmail = user?.email;
  
  if (!userEmail) return null;

  const role = await getUserRole(userEmail);
  if (role !== "admin") {
    redirect("/");
  }

  let allProfiles: any[] = [];
  try {
    const { data: profilesData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (profilesData) allProfiles = profilesData;
  } catch (e) {}

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-heading text-[#1C2439] tracking-tight">User Management</h1>
      </div>
      
      <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
          <Users className="w-4 h-4 text-slate-500" />
          <h2 className="text-sm font-semibold text-[#1C2439]">System Users</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Current Role</th>
                <th className="px-6 py-3 font-medium">Status / Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allProfiles.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-medium text-[#1C2439]">
                    {p.email}
                    {p.email === userEmail && <span className="ml-2 text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase">You</span>}
                  </td>
                  <td className="px-6 py-4 text-slate-500 uppercase text-xs font-bold">
                    <span className={`px-2 py-1 rounded-full ${p.role === 'admin' ? 'bg-[#E76257]/10 text-[#E76257]' : p.role === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                      {p.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {p.email === userEmail ? (
                      <span className="text-xs text-slate-400 italic">Cannot modify own account</span>
                    ) : (
                      <UserActionButtons email={p.email} role={p.role} requestedAdmin={p.request_admin_access} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
