"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export async function addVendor(formData: FormData) {
  const name = (formData.get("name") as string)?.slice(0, 100);
  const category = (formData.get("category") as string)?.slice(0, 50);
  const certsRaw = (formData.get("certs") as string)?.slice(0, 500);
  
  const compliance_certs = certsRaw ? certsRaw.split(",").map(c => c.trim()) : [];
  
  let sla_uptime_promise = parseFloat(formData.get("sla") as string);
  
  // Boundary check validation
  if (isNaN(sla_uptime_promise) || sla_uptime_promise < 0 || sla_uptime_promise > 100) {
    return { error: "Invalid SLA Promise value. Must be a number between 0 and 100." };
  }
  
  const actual_sla = sla_uptime_promise;

  let riskScore = 1;
  const diff = sla_uptime_promise - actual_sla;
  if (diff > 0) {
    // 5 points per 1% missed (e.g. 0.5% miss = +2.5 risk)
    riskScore += diff * 5; 
  }
  riskScore = Math.min(Math.max(Math.round(riskScore), 1), 10);

  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    const userEmail = user?.email || "Unknown User";

    const { error: vendorError } = await supabase.from('vendors').insert([
      {
        name,
        category,
        sla_uptime_promise,
        actual_sla,
        compliance_certs,
        calculated_risk_score: riskScore,
        criticality_score: 3,
        data_sensitivity_score: 3
      }
    ]);

    if (vendorError) {
      console.error("Error adding vendor:", vendorError);
      return { error: `Failed to add vendor: ${vendorError.message || vendorError.details || JSON.stringify(vendorError)}` };
    }

    // 2. Insert Audit Log
    await supabase.from('audit_logs').insert([
      {
        action: "Vendor Created",
        user: userEmail,
        details: `Added '${name}' to ${category} category.`
      }
    ]);

    // 3. Revalidate Dashboard and Vendors pages
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Error:", error);
    return { error: "Failed to add vendor" };
  }
}

export async function updateVendor(formData: FormData) {
  const id = formData.get("id") as string;
  const sla_uptime_promise = parseFloat(formData.get("sla_uptime_promise") as string);
  const actual_sla = parseFloat(formData.get("actual_sla") as string);

  // Boundary check validation
  if (isNaN(sla_uptime_promise) || isNaN(actual_sla) || 
      sla_uptime_promise < 0 || sla_uptime_promise > 100 || 
      actual_sla < 0 || actual_sla > 100) {
    return { error: "Invalid SLA values. Must be a number between 0 and 100." };
  }

  let riskScore = 1;
  const diff = sla_uptime_promise - actual_sla;
  if (diff > 0) {
    // 5 points per 1% missed (e.g. 0.5% miss = +2.5 risk)
    riskScore += diff * 5; 
  }
  riskScore = Math.min(Math.max(Math.round(riskScore), 1), 10);

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: updatedRows, error } = await supabase.from('vendors').update({
      sla_uptime_promise,
      actual_sla,
      calculated_risk_score: riskScore
    }).eq('id', id).select();

    if (error) {
      console.error(error);
      return { error: "Failed to update vendor. Ensure you have permission." };
    }
    
    if (!updatedRows || updatedRows.length === 0) {
      return { error: "Permission denied: You can only edit vendors you created." };
    }

    await supabase.from('audit_logs').insert([{
      action: "Vendor Updated",
      user: user.email,
      details: `Updated SLAs for vendor ID: ${id}`
    }]);

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    return { error: "Failed to update vendor" };
  }
}

export async function deleteVendor(formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: deletedRows, error } = await supabase
      .from('vendors')
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      console.error("Delete error:", error);
      return { error: "Failed to delete vendor" };
    }
    
    if (!deletedRows || deletedRows.length === 0) {
      return { error: "Permission denied: You can only delete vendors you created." };
    }

    await supabase.from('audit_logs').insert([{
      action: "Vendor Deleted",
      user: user.email,
      details: `Deleted vendor: ${name}`
    }]);

    revalidatePath("/vendors");
    revalidatePath("/activity");
    revalidatePath("/");
    
    return { success: true };
  } catch (e: any) {
    console.error(e);
    return { error: "An unexpected error occurred" };
  }
}

export async function requestDeletion(formData: FormData) {
  try {
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    
    if (!id || !name) {
      return { error: "Missing vendor information" };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Create a special audit log that acts as a deletion request
    const { error } = await supabase.from('audit_logs').insert([{
      action: "Deletion Request",
      user: user.email,
      details: `Requested deletion for vendor: ${name} (ID: ${id})`
    }]);

    if (error) {
      console.error("Request error:", error);
      return { error: "Failed to submit deletion request" };
    }

    revalidatePath("/vendors");
    revalidatePath("/activity");
    revalidatePath("/action-needed");
    
    return { success: true };
  } catch (e: any) {
    console.error(e);
    return { error: "An unexpected error occurred" };
  }
}

export async function markDeletionRequestCompleted(id: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase
      .from('audit_logs')
      .update({ action: "Deletion Request [COMPLETED]" })
      .eq('id', id);

    if (error) {
      console.error("Complete error:", error);
      return { error: "Failed to mark as completed" };
    }

    revalidatePath("/action-needed");
    return { success: true };
  } catch (e: any) {
    console.error(e);
    return { error: "An unexpected error occurred" };
  }
}
