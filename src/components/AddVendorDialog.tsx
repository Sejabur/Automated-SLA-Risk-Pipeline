"use client"

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState, useTransition } from "react";
import { addVendor } from "@/app/actions/vendors";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

export function AddVendorDialog() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const res = await addVendor(formData);
      if (res?.error) {
        setError(res.error);
      } else {
        setOpen(false);
        setError(null);
      }
    });
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="bg-[#1C2439] hover:bg-slate-800 text-white shadow-sm font-medium h-9 px-4 rounded-md transition-colors">
        <Plus className="w-4 h-4 mr-2" />
        Add Vendor
      </Button>
      
      <AnimatePresence>
        {open && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[450px] border border-slate-200 rounded-xl bg-white p-0 shadow-xl overflow-hidden">
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="p-6"
              >
                <DialogHeader className="mb-6">
                  <DialogTitle className="font-heading font-bold text-xl text-[#1C2439] tracking-tight">Add New Vendor</DialogTitle>
                  <DialogDescription className="text-sm text-slate-500 mt-1">
                    Enter the vendor details below. Their risk profile will be automatically calculated.
                  </DialogDescription>
                </DialogHeader>

                {error && (
                  <div className="mb-5 text-sm font-medium text-rose-600 bg-rose-50 border border-rose-100 rounded-md p-3">
                    {error}
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="name" className="text-sm font-medium text-slate-700">Vendor Name</label>
                    <Input id="name" name="name" required className="border-slate-200 focus-visible:ring-[#E76257]/20 focus-visible:border-[#E76257] rounded-md shadow-sm h-9 text-sm transition-all" placeholder="Vendor Name" />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="category" className="text-sm font-medium text-slate-700">Category</label>
                    <Input id="category" name="category" required className="border-slate-200 focus-visible:ring-[#E76257]/20 focus-visible:border-[#E76257] rounded-md shadow-sm h-9 text-sm transition-all" placeholder="Service Category" />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="sla" className="text-sm font-medium text-slate-700">SLA Promise (%)</label>
                    <Input id="sla" name="sla" type="number" step="0.01" min="0" max="100" required className="border-slate-200 focus-visible:ring-[#E76257]/20 focus-visible:border-[#E76257] rounded-md shadow-sm h-9 text-sm transition-all" placeholder="99.9" />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="certs" className="text-sm font-medium text-slate-700">Certifications</label>
                    <Input id="certs" name="certs" required className="border-slate-200 focus-visible:ring-[#E76257]/20 focus-visible:border-[#E76257] rounded-md shadow-sm h-9 text-sm transition-all" placeholder="SOC2, ISO27001, etc." />
                  </div>
                  <div className="pt-2 flex justify-end gap-3">
                    <Button type="button" disabled={isPending} variant="outline" onClick={() => setOpen(false)} className="border-slate-200 text-slate-700">Cancel</Button>
                    <Button disabled={isPending} type="submit" className="bg-[#E76257] hover:bg-[#D54A3E] text-white rounded-md h-9 px-6 font-medium shadow-sm transition-colors">
                      {isPending ? "Saving..." : "Save Vendor"}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
}
