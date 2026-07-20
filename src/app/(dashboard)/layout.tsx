import { LayoutDashboard, Users, Settings, Lock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { MobileNavigation } from "@/components/MobileNavigation";
import { createClient } from "@/utils/supabase/server";
import { getUserRole } from "@/utils/roles";
import { DesktopNavigation } from "@/components/DesktopNavigation";
import { signout } from "@/app/login/actions";
import { InitialLoader } from "@/components/InitialLoader";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let userEmail;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    userEmail = user?.email;
  } catch (e) {}

  const role = await getUserRole(userEmail);

  if (role === "unauthenticated") {
    return <InitialLoader />;
  }

  if (role === "pending") {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-slate-100 p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-2">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-[#1C2439] font-heading">Waiting for Approval</h2>
          <p className="text-slate-500">Your account has been created but is pending administrator approval. You will receive an email once your access is granted.</p>
          <form action={signout}>
            <button type="submit" className="text-[#E76257] hover:underline font-medium text-sm">Sign Out and Return to Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#FAF9F6] overflow-hidden">
      
      {/* Mobile Header & Sidebar (Hidden on md+) */}
      <MobileNavigation role={role} />

      {/* Desktop Sidebar (Hidden on md) */}
      <DesktopNavigation role={role} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
