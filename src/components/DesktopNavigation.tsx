"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { LayoutDashboard, Users, ShieldCheck, UserCog, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { signout } from "@/app/login/actions";

export function DesktopNavigation({ role }: { role?: string }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside className={`hidden md:flex bg-slate-50 border-r border-slate-200 flex-col transition-all duration-300 relative ${collapsed ? 'w-20' : 'w-64'}`}>
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 bg-white border border-slate-200 rounded-full p-1 text-slate-400 hover:text-[#E76257] shadow-sm z-10 transition-colors"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      <div className={`p-5 flex items-center border-b border-slate-200 h-[73px] ${collapsed ? 'justify-center' : 'gap-3'}`}>
        <Image src="/logo.svg" alt="ASRP Logo" width={32} height={32} className="rounded-md shadow-sm min-w-[32px]" />
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-heading font-extrabold text-xl text-[#1C2439] tracking-tight leading-none">ASRP</span>
            <span className="font-sans font-medium text-[10px] text-slate-500 leading-none mt-0.5">by sejabur.dev</span>
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-2">
        <NavItem href="/" icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" active={pathname === "/"} collapsed={collapsed} />
        <NavItem href="/vendors" icon={<Users className="w-5 h-5" />} label="Vendors" active={pathname?.startsWith("/vendors")} collapsed={collapsed} />
        
        {role === "admin" && (
          <>
            <NavItem href="/action-needed" icon={<ShieldCheck className="w-5 h-5" />} label="Action Needed" active={pathname?.startsWith("/action-needed")} collapsed={collapsed} />
            <NavItem href="/users" icon={<UserCog className="w-5 h-5" />} label="User Management" active={pathname?.startsWith("/users")} collapsed={collapsed} />
            <NavItem href="/activity" icon={<ShieldCheck className="w-5 h-5" />} label="Activity Log" active={pathname?.startsWith("/activity")} collapsed={collapsed} />
          </>
        )}
      </nav>

      <div className="p-3 border-t border-slate-200">
        <form action={signout}>
          <button 
            type="submit"
            className={`flex items-center gap-3 px-3 py-2.5 w-full font-medium text-sm rounded-md transition-colors text-rose-600 hover:bg-rose-50 hover:text-rose-700 ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? "Sign Out" : undefined}
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </form>
      </div>
    </aside>
  );
}

function NavItem({ href, icon, label, active, collapsed }: { href: string, icon: React.ReactNode, label: string, active: boolean, collapsed: boolean }) {
  return (
    <Link 
      href={href} 
      title={collapsed ? label : undefined}
      className={`flex items-center gap-3 px-3 py-2.5 font-medium text-sm rounded-md transition-colors ${
        active 
          ? 'bg-[#E76257]/10 text-[#E76257]' 
          : 'text-slate-600 hover:bg-slate-200/50 hover:text-[#1C2439]'
      } ${collapsed ? 'justify-center' : ''}`}
    >
      {icon}
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}
