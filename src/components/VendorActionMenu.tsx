"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2, Trash2 } from "lucide-react";
import { updateVendor, deleteVendor } from "@/app/actions/vendors";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { requestDeletion } from "@/app/actions/vendors";
export function VendorActionMenu({ vendor, userRole }: { vendor: any, userRole?: string }) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [editError, setEditError] = useState("");

  async function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEditError("");
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateVendor(formData);
      if (res?.error) {
        setEditError(res.error);
      } else {
        setEditOpen(false);
      }
    });
  }

  const [deleteError, setDeleteError] = useState("");

  const isOperator = userRole === "operator";

  async function handleDeleteConfirm() {
    setDeleteError("");
    const formData = new FormData();
    formData.append("id", vendor.id);
    formData.append("name", vendor.name);
    startTransition(async () => {
      let res;
      if (isOperator) {
        res = await requestDeletion(formData);
      } else {
        res = await deleteVendor(formData);
      }
      
      if (res?.error) {
        setDeleteError(res.error);
      } else {
        setDeleteOpen(false);
      }
    });
  }

  return (
    <>
      <div className="flex items-center gap-1">
        <Button onClick={() => setEditOpen(true)} variant="outline" size="sm" className="h-7 px-2 text-xs border-slate-200 text-slate-600 hover:bg-slate-50" title="Edit SLAs">
          <Edit2 className="h-3.5 w-3.5" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => setDeleteOpen(true)} className="h-7 px-2 text-xs border-rose-200 text-rose-600 hover:bg-rose-50" title={isOperator ? "Request Deletion" : "Delete Vendor"}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      <AnimatePresence>
        {deleteOpen && (
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogContent className="sm:max-w-[425px] border border-slate-200 rounded-xl bg-white p-0 shadow-lg overflow-hidden">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="p-6"
              >
                <DialogHeader className="mb-5">
                  <DialogTitle className="font-heading font-semibold text-lg text-slate-900 tracking-tight">
                    {isOperator ? "Request Vendor Deletion" : "Delete Vendor"}
                  </DialogTitle>
                  <DialogDescription className="text-sm text-slate-500 mt-1">
                    {isOperator 
                      ? <>Are you sure you want to request deletion for <span className="font-semibold text-slate-900">{vendor.name}</span>? An admin will review this.</>
                      : <>Are you sure you want to delete <span className="font-semibold text-slate-900">{vendor.name}</span>? This action cannot be undone.</>
                    }
                  </DialogDescription>
                </DialogHeader>
                {deleteError && (
                  <div className="mb-4 text-sm font-medium text-rose-600 bg-rose-50 border border-rose-100 rounded-md p-3">
                    {deleteError}
                  </div>
                )}
                <div className="flex justify-end gap-3 pt-4">
                  <Button disabled={isPending} variant="outline" onClick={() => setDeleteOpen(false)} className="border-slate-200 text-slate-700">Cancel</Button>
                  <Button disabled={isPending} onClick={handleDeleteConfirm} className="bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-colors">
                    {isPending ? "Processing..." : isOperator ? "Send Request" : "Delete"}
                  </Button>
                </div>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[425px] border border-slate-200 rounded-xl bg-white p-0 shadow-lg">
          <div className="p-6">
            <DialogHeader className="mb-5">
              <DialogTitle className="font-heading font-semibold text-lg text-slate-900 tracking-tight">Edit Vendor SLAs</DialogTitle>
              <DialogDescription className="text-sm text-slate-500 mt-1">
                Update the promised and actual SLA values for {vendor.name}.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <input type="hidden" name="id" value={vendor.id} />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="sla_uptime_promise" className="text-sm font-medium text-slate-700">SLA Promise (%)</label>
                  <Input id="sla_uptime_promise" name="sla_uptime_promise" type="number" step="0.01" min="0" max="100" defaultValue={vendor.sla_uptime_promise} required className="border-slate-200 focus-visible:ring-[#E76257]/20 focus-visible:border-[#E76257] rounded-md shadow-sm h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="actual_sla" className="text-sm font-medium text-slate-700">Actual SLA (%)</label>
                  <Input id="actual_sla" name="actual_sla" type="number" step="0.01" min="0" max="100" defaultValue={vendor.actual_sla} required className="border-slate-200 focus-visible:ring-[#E76257]/20 focus-visible:border-[#E76257] rounded-md shadow-sm h-9 text-sm" />
                </div>
              </div>
              {editError && (
                <div className="text-sm font-medium text-rose-600 bg-rose-50 border border-rose-100 rounded-md p-3">
                  {editError}
                </div>
              )}
              <div className="pt-2">
                <Button disabled={isPending} type="submit" className="w-full bg-[#1C2439] hover:bg-slate-800 text-white rounded-md h-9 font-medium shadow-sm transition-colors mt-2">
                  {isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
