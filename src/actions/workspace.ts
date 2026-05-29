"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function bootstrapWorkspace(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const workspaceName = formData.get("workspace_name") as string;
  const companyName = formData.get("company_name") as string;
  const companyCode = formData.get("company_code") as string;

  // Create workspace
  const { data: workspace, error: wsError } = await supabase
    .from("workspaces")
    .insert({ name: workspaceName })
    .select()
    .single();

  if (wsError) return { error: wsError.message };

  // Create user profile
  const { error: userError } = await supabase.from("users").insert({
    id: user.id,
    workspace_id: workspace.id,
    email: user.email!,
    role: "owner",
    full_name: user.user_metadata?.full_name ?? null,
    onboarding_completed: false,
  });

  if (userError) return { error: userError.message };

  // Create first insurance company
  if (companyName && companyCode) {
    await supabase.from("insurance_companies").insert({
      workspace_id: workspace.id,
      name: companyName,
      code: companyCode.toUpperCase(),
      active: true,
    });
  }

  // Mark onboarding complete
  await supabase
    .from("users")
    .update({ onboarding_completed: true })
    .eq("id", user.id);

  redirect("/dashboard");
}

export async function ensureUserProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("id, workspace_id, onboarding_completed")
    .eq("id", user.id)
    .single();

  return profile;
}
