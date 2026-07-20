"use client"

import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, AlertTriangle } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AIBriefButtonProps {
  vendor: {
    name: string;
    category: string;
    calculated_risk_score: number;
    compliance_certs: string[];
    sla_uptime_promise?: number;
    actual_sla?: number;
  }
}

export function AIBriefButton({ vendor }: AIBriefButtonProps) {
  const [open, setOpen] = useState(false);
  const [brief, setBrief] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGenerateBrief() {
    setOpen(true);
    setLoading(true);
    try {
      const res = await fetch("/api/ai-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorName: vendor.name,
          category: vendor.category,
          riskScore: vendor.calculated_risk_score,
          certs: vendor.compliance_certs || [],
          promisedSla: vendor.sla_uptime_promise,
          actualSla: vendor.actual_sla,
        }),
      });
      const data = await res.json();
      setBrief(data.brief || "Failed to generate brief.");
    } catch (error) {
      setBrief("An error occurred while generating the brief.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button 
        size="sm" 
        variant="outline" 
        onClick={handleGenerateBrief}
        className="border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 hover:text-[#E76257] hover:border-[#E76257]/30 shadow-sm h-8 px-3 font-medium transition-all opacity-60 group-hover:opacity-100 hover:opacity-100 focus:opacity-100"
      >
        <Sparkles className="w-3.5 h-3.5 mr-1.5" />
        AI Brief
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px] border border-slate-200 shadow-xl rounded-xl bg-white p-0">
          <div className="p-6">
            <DialogHeader className="mb-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#E76257]" />
                <DialogTitle className="font-heading font-semibold text-lg text-slate-900 tracking-tight">
                  AI Executive Brief
                </DialogTitle>
              </div>
              <DialogDescription className="text-sm font-medium text-slate-500 pt-1">
                Target: {vendor.name}
              </DialogDescription>
            </DialogHeader>
            <div className="min-h-[100px] flex items-center justify-center py-2">
              {loading ? (
                <div className="flex flex-col items-center gap-3 text-slate-500">
                  <Loader2 className="w-6 h-6 animate-spin text-[#E76257]" />
                  <span className="font-medium text-sm">Synthesizing Risk Data...</span>
                </div>
              ) : (
                <p className="font-medium text-slate-700 leading-relaxed text-sm border-l-2 border-[#E76257] pl-4">
                  {brief}
                </p>
              )}
            </div>
            {!loading && (
              <div className="pt-2 mt-4">
                <div className="bg-amber-50 rounded p-3 mb-4 border border-amber-100 flex gap-2 items-start text-amber-700 shadow-sm">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <p className="text-xs font-medium leading-relaxed"><strong>Warning:</strong> AI can make mistakes. Always double check before taking major decisions.</p>
                </div>
                <Button onClick={() => setOpen(false)} className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-md h-9 font-medium shadow-sm transition-colors">
                  Acknowledge
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

