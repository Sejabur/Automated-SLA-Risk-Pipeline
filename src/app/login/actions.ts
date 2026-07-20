"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  } catch (e: any) {
    const msg = e?.message || "Could not authenticate user";
    redirect(`/login?message=${encodeURIComponent(msg)}`);
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const supabase = await createClient();
    
    // Explicit duplicate check
    const { data: existing } = await supabase.from('profiles').select('id').eq('email', email).single();
    if (existing) {
      throw new Error("An account with this email already exists.");
    }

    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  } catch (e: any) {
    const msg = e?.message || "Could not create user";
    redirect(`/login?message=${encodeURIComponent(msg)}`);
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signout() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (e) {}

  redirect("/login");
}
