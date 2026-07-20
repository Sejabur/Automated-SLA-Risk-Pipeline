"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { LayoutDashboard, Users, ShieldCheck, UserCog, Menu, X, LogOut } from "lucide-react";
import { signout } from "@/app/login/actions";
import { motion, AnimatePresence } from "framer-motion";

export function MobileNavigation({ role }: { role: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Static Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-3">
          <Image src="/logo.svg" alt="ASRP Logo" width={28} height={28} className="rounded-md shadow-sm" />
          <div className="flex flex-col">
            <span className="font-heading font-extrabold text-lg text-[#1C2439] tracking-tight leading-none">ASRP</span>
            <span className="font-sans font-medium text-[9px] text-slate-500 leading-none mt-0.5">by sejabur.dev</span>
          </div>
        </div>
        <button onClick={() => setIsOpen(true)} className="p-2 bg-white text-slate-700 shadow-sm border border-slate-200 rounded-md hover:bg-slate-50 focus:outline-none transition-colors">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Sidebar Overlay with Framer Motion */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" 
              onClick={closeMenu} 
            />
            
            {/* Sidebar */}
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="relative w-64 max-w-sm h-full bg-slate-50 shadow-2xl flex flex-col"
            >
              <div className="p-4 flex items-center justify-between border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <Image src="/logo.svg" alt="ASRP Logo" width={32} height={32} className="rounded-md shadow-sm" />
                  <div className="flex flex-col">
                    <span className="font-heading font-extrabold text-xl text-[#1C2439] tracking-tight leading-none">ASRP</span>
                    <span className="font-sans font-medium text-[10px] text-slate-500 leading-none mt-0.5">by sejabur.dev</span>
                  </div>
                </div>
                <button onClick={closeMenu} className="p-2 text-slate-400 hover:text-slate-900 focus:outline-none rounded-md">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                <Link onClick={closeMenu} href="/" className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${pathname === '/' ? 'bg-[#E76257]/10 text-[#E76257]' : 'text-slate-600 hover:bg-slate-200/50 hover:text-[#1C2439]'}`}>
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link onClick={closeMenu} href="/vendors" className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${pathname === '/vendors' ? 'bg-[#E76257]/10 text-[#E76257]' : 'text-slate-600 hover:bg-slate-200/50 hover:text-[#1C2439]'}`}>
                  <Users className="w-4 h-4" />
                  Vendors
                </Link>
                
                {role === "admin" && (
                  <>
                    <Link onClick={closeMenu} href="/action-needed" className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${pathname === '/action-needed' ? 'bg-[#E76257]/10 text-[#E76257]' : 'text-slate-600 hover:bg-slate-200/50 hover:text-[#1C2439]'}`}>
                      <ShieldCheck className="w-4 h-4" />
                      Action Needed
                    </Link>
                    <Link onClick={closeMenu} href="/users" className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${pathname === '/users' ? 'bg-[#E76257]/10 text-[#E76257]' : 'text-slate-600 hover:bg-slate-200/50 hover:text-[#1C2439]'}`}>
                      <UserCog className="w-4 h-4" />
                      User Management
                    </Link>
                    <Link onClick={closeMenu} href="/activity" className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${pathname === '/activity' ? 'bg-[#E76257]/10 text-[#E76257]' : 'text-slate-600 hover:bg-slate-200/50 hover:text-[#1C2439]'}`}>
                      <ShieldCheck className="w-4 h-4" />
                      Activity Log
                    </Link>
                  </>
                )}
              </nav>
  
              <div className="p-3 border-t border-slate-200">
                <form action={signout}>
                  <button type="submit" className="flex items-center gap-3 px-3 py-2 w-full text-sm font-medium rounded-md transition-colors text-rose-600 hover:bg-rose-50 hover:text-rose-700">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
