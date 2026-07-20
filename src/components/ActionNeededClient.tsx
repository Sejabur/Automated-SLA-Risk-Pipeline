"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, UserPlus, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { markDeletionRequestCompleted } from "@/app/actions/vendors";
import { promoteUser, denyRequest } from "@/app/actions/users";

export function ActionNeededClient({ 
  initialPendingUsers, 
  initialDeletionRequests 
}: { 
  initialPendingUsers: any[], 
  initialDeletionRequests: any[] 
}) {
  const [isPending, startTransition] = useTransition();

  async function handleMarkCompleted(id: string) {
    startTransition(async () => {
      await markDeletionRequestCompleted(id);
    });
  }

  async function handleApproveUser(id: string) {
    const formData = new FormData();
    formData.append("userId", id);
    formData.append("newRole", "operator");
    startTransition(async () => {
      await promoteUser(formData);
    });
  }

  async function handleDenyUser(id: string) {
    const formData = new FormData();
    formData.append("userId", id);
    startTransition(async () => {
      await denyRequest(formData);
    });
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Deletion Requests Column */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-rose-500" />
          <h2 className="font-semibold text-[#1C2439]">Vendor Deletion Requests</h2>
        </div>
        <div className="p-0 divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
          {initialDeletionRequests.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm">No pending deletion requests.</p>
            </div>
          ) : (
            initialDeletionRequests.map((req) => {
              const isCompleted = req.action === "Deletion Request [COMPLETED]";
              return (
                <div key={req.id} className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-opacity ${isCompleted ? 'opacity-50 grayscale bg-slate-50/50' : 'hover:bg-slate-50'}`}>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{req.details}</p>
                    <p className="text-xs text-slate-500 mt-1">{new Date(req.timestamp).toLocaleString()}</p>
                  </div>
                  {!isCompleted && (
                    <Button 
                      disabled={isPending}
                      onClick={() => handleMarkCompleted(req.id)}
                      size="sm"
                      variant="outline"
                      className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 h-8 text-xs font-medium shrink-0"
                    >
                      <Check className="w-3.5 h-3.5 mr-1.5" />
                      Mark Completed
                    </Button>
                  )}
                  {isCompleted && (
                    <span className="text-xs font-medium text-emerald-600 flex items-center shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Completed
                    </span>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* User Approvals Column */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-amber-500" />
          <h2 className="font-semibold text-[#1C2439]">New User Approvals</h2>
        </div>
        <div className="p-0 divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
          {initialPendingUsers.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm">No users waiting for approval.</p>
            </div>
          ) : (
            initialPendingUsers.map((user) => (
              <div key={user.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-slate-900">{user.email}</p>
                  <p className="text-xs text-slate-500 mt-1">Requested: {new Date(user.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button 
                    disabled={isPending}
                    onClick={() => handleApproveUser(user.id)}
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs font-medium shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5 mr-1" />
                    Approve
                  </Button>
                  <Button 
                    disabled={isPending}
                    onClick={() => handleDenyUser(user.id)}
                    size="sm"
                    variant="outline"
                    className="border-rose-200 text-rose-600 hover:bg-rose-50 h-8 text-xs font-medium shadow-sm"
                  >
                    <X className="w-3.5 h-3.5 mr-1" />
                    Deny
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
