"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export function InitialLoader() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 3.5s loading animation
    const duration = 3500;
    const intervalTime = 50;
    const increment = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + increment;
      });
    }, intervalTime);

    const redirectTimer = setTimeout(() => {
      router.push("/login");
    }, duration);

    return () => {
      clearInterval(timer);
      clearTimeout(redirectTimer);
    };
  }, [router]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#FAF9F6] z-50">
      <div className="flex flex-col items-center space-y-6 animate-in fade-in duration-500 w-full max-w-xs px-6">
        <div className="relative">
          <Image src="/logo.svg" alt="ASRP Logo" width={64} height={64} className="rounded-xl shadow-md" />
          <div className="absolute inset-0 bg-[#E76257]/20 rounded-xl animate-pulse"></div>
        </div>
        
        <div className="text-center space-y-2 w-full">
          <h2 className="text-xl font-bold font-heading text-[#1C2439] tracking-tight">ASRP</h2>
          <p className="text-sm text-slate-500 font-medium">Initializing Workspace...</p>
        </div>

        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden shadow-inner">
          <div 
            className="h-full bg-[#E76257] rounded-full transition-all duration-75 ease-linear"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
