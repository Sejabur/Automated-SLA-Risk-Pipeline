"use client";

import { Button } from "@/components/ui/button";
import { promoteUser, denyRequest, promoteToAdmin, removeAccess } from "@/app/actions/users";
import { useTransition, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function UserActionButtons({ email, role, requestedAdmin }: { email: string, role: string, requestedAdmin: boolean }) {
  const [isPending, startTransition] = useTransition();
  
  // Dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => Promise<any> | void>();
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmTitle, setConfirmTitle] = useState("");

  const triggerConfirm = (title: string, message: string, actionFn: () => Promise<any> | void) => {
    setConfirmTitle(title);
    setConfirmMessage(message);
    setConfirmAction(() => actionFn);
    setConfirmOpen(true);
  };

  const handleExecute = () => {
    if (confirmAction) {
      startTransition(async () => {
        await confirmAction();
        setConfirmOpen(false);
      });
    }
  };

  const executeAction = async (action: Function, email: string) => {
    const formData = new FormData();
    formData.append("email", email);
    await action(formData);
  };

  return (
    <>
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-[425px] border border-slate-200 rounded-xl bg-white p-0 shadow-lg">
          <div className="p-6">
            <DialogHeader className="mb-5">
              <DialogTitle className="font-heading font-semibold text-lg text-slate-900 tracking-tight">{confirmTitle}</DialogTitle>
              <DialogDescription className="text-sm text-slate-500 mt-1">
                {confirmMessage}
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-3 pt-4">
              <Button disabled={isPending} variant="outline" onClick={() => setConfirmOpen(false)} className="border-slate-200 text-slate-700">Cancel</Button>
              <Button disabled={isPending} onClick={handleExecute} className="bg-[#1C2439] hover:bg-slate-800 text-white shadow-sm transition-colors">
                {isPending ? "Executing..." : "Confirm"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex items-center gap-2">
        {requestedAdmin && role !== 'admin' && (
          <>
            <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-1 rounded">Requested Admin</span>
            <Button disabled={isPending} onClick={() => startTransition(() => executeAction(promoteUser, email))} size="sm" className="h-6 text-[10px] px-2 bg-emerald-600 hover:bg-emerald-700 text-white">
              Approve
            </Button>
            <Button disabled={isPending} onClick={() => triggerConfirm("Deny Request", "Deny this admin request?", () => executeAction(denyRequest, email))} size="sm" variant="outline" className="h-6 text-[10px] px-2 border-rose-200 text-rose-600 hover:bg-rose-50">
              Deny
            </Button>
          </>
        )}

        {role === 'pending' && !requestedAdmin && (
          <Button disabled={isPending} onClick={() => startTransition(() => executeAction(promoteUser, email))} size="sm" className="h-6 text-[10px] px-2 bg-emerald-600 hover:bg-emerald-700 text-white">
            Approve as Operator
          </Button>
        )}

        {role === 'operator' && !requestedAdmin && (
          <>
            <Button disabled={isPending} onClick={() => triggerConfirm("Promote User", "Are you sure you want to promote this user to Admin?", () => executeAction(promoteToAdmin, email))} size="sm" className="h-6 text-[10px] px-2 bg-[#1C2439] hover:bg-slate-800 text-white">
              Make Admin
            </Button>
            <Button disabled={isPending} onClick={() => triggerConfirm("Remove Access", "Are you sure you want to revoke this user's access?", () => executeAction(removeAccess, email))} size="sm" variant="outline" className="h-6 text-[10px] px-2 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700">
              Remove Access
            </Button>
          </>
        )}

        {role === 'admin' && (
          <Button disabled={isPending} onClick={() => triggerConfirm("Demote Admin", "Are you sure you want to demote this admin?", () => executeAction(removeAccess, email))} size="sm" variant="outline" className="h-6 text-[10px] px-2 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700">
            Demote / Remove
          </Button>
        )}
      </div>
    </>
  );
}
