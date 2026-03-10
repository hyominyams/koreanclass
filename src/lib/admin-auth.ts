import "server-only";

import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { isSupabaseConfigured } from "@/lib/supabase";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminLoginResult =
  | { ok: true }
  | { ok: false; reason: "not_configured" | "invalid_credentials" | "not_admin" };

function isAdminUser(user: User | null) {
  return user?.app_metadata?.role === "admin";
}

export function isAdminConfigured() {
  return isSupabaseConfigured();
}

export async function getAdminUser() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !isAdminUser(user)) {
    return null;
  }

  return user;
}

export async function isAdminAuthenticated() {
  return Boolean(await getAdminUser());
}

export async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }
}

export async function loginAdmin(email: string, password: string): Promise<AdminLoginResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, reason: "not_configured" };
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return { ok: false, reason: "not_configured" };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    return { ok: false, reason: "invalid_credentials" };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !isAdminUser(user)) {
    await supabase.auth.signOut();
    return { ok: false, reason: "not_admin" };
  }

  return { ok: true };
}

export async function logoutAdmin() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return;
  }

  await supabase.auth.signOut();
}
