import { createClient } from "@/utils/supabase/server";

export type UserRole = "admin" | "operator" | "pending" | "unauthenticated";

export async function getUserRole(email?: string | null): Promise<UserRole> {
  if (!email) return "unauthenticated";
  
  try {
    const supabase = await createClient();
    const { data } = await supabase.from('profiles').select('role').eq('email', email).single();
    if (data && data.role) {
      return data.role as UserRole;
    }
  } catch (e) {
    console.error("Error fetching role", e);
  }
  
  return "pending";
}
