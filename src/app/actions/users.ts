"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export async function requestAdminAccess(formData?: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from('profiles')
    .update({ request_admin_access: true })
    .eq('id', user.id);

  if (error) {
    console.error("Error requesting access:", error);
    return { error: "Failed to request access" };
  }

  // Create audit log
  await supabase.from('audit_logs').insert([{
    action: "Admin Access Requested",
    user: user.email,
    details: "User requested admin privileges."
  }]);

  revalidatePath("/", "layout");
}

export async function promoteUser(formData: FormData) {
  const targetEmail = formData.get("email") as string;
  const supabase = await createClient();
  
  // Verify requester is admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };
  
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return { error: "Forbidden" };

  // If the user was 'pending', we promote to 'operator'. If they requested admin, promote to 'admin'.
  const { data: targetProfile } = await supabase.from('profiles').select('*').eq('email', targetEmail).single();
  if (!targetProfile) return { error: "User not found" };

  let newRole = 'operator';
  if (targetProfile.request_admin_access) {
    newRole = 'admin';
  }

  const { error } = await supabase
    .from('profiles')
    .update({ 
      role: newRole,
      request_admin_access: false
    })
    .eq('email', targetEmail);

  if (error) {
    console.error("Error promoting user:", error);
    return { error: "Failed to promote user" };
  }

  await supabase.from('audit_logs').insert([{
    action: "User Promoted",
    user: user.email,
    details: `Promoted ${targetEmail} to ${newRole}.`
  }]);

  revalidatePath("/", "layout");
}

export async function denyRequest(formData: FormData) {
  const targetEmail = formData.get("email") as string;
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };
  
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return { error: "Forbidden" };

  const { error } = await supabase
    .from('profiles')
    .update({ request_admin_access: false })
    .eq('email', targetEmail);

  if (error) {
    console.error("Error denying request:", error);
    return { error: "Failed to deny request" };
  }

  await supabase.from('audit_logs').insert([{
    action: "Admin Request Denied",
    user: user.email,
    details: `Denied admin request for ${targetEmail}.`
  }]);

  revalidatePath("/", "layout");
}

export async function promoteToAdmin(formData: FormData) {
  const targetEmail = formData.get("email") as string;
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };
  
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return { error: "Forbidden" };

  const { error } = await supabase
    .from('profiles')
    .update({ role: 'admin', request_admin_access: false })
    .eq('email', targetEmail);

  if (error) return { error: "Failed to promote to admin" };

  await supabase.from('audit_logs').insert([{
    action: "User Promoted to Admin",
    user: user.email,
    details: `Converted ${targetEmail} to an Admin account.`
  }]);

  revalidatePath("/", "layout");
}

export async function removeAccess(formData: FormData) {
  const targetEmail = formData.get("email") as string;
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };
  
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return { error: "Forbidden" };

  const { error } = await supabase
    .from('profiles')
    .update({ role: 'pending', request_admin_access: false })
    .eq('email', targetEmail);

  if (error) return { error: "Failed to remove access" };

  await supabase.from('audit_logs').insert([{
    action: "User Access Removed",
    user: user.email,
    details: `Revoked access for ${targetEmail} (set to pending).`
  }]);

  revalidatePath("/", "layout");
}
