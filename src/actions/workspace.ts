"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function bootstrapWorkspace(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Guard: if user already has a profile, don't create another workspace
  const { data: existing } = await supabase
    .from("users")
    .select("id, workspace_id, onboarding_completed")
    .eq("id", user.id)
    .single();

  if (existing?.workspace_id) {
    // Already has a workspace — mark onboarding complete and go to dashboard
    if (!existing.onboarding_completed) {
      await supabase.from("users").update({ onboarding_completed: true }).eq("id", user.id);
    }
    redirect("/dashboard");
  }

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

  if (userError) {
    // Roll back workspace if profile creation fails
    await supabase.from("workspaces").delete().eq("id", workspace.id);
    return { error: userError.message };
  }

  // Create first insurance company
  if (companyName && companyCode) {
    const { error: companyError } = await supabase.from("insurance_companies").insert({
      workspace_id: workspace.id,
      name: companyName,
      code: companyCode.toUpperCase(),
      active: true,
    });
    if (companyError) return { error: companyError.message };
  }

  // Mark onboarding complete
  await supabase.from("users").update({ onboarding_completed: true }).eq("id", user.id);

  redirect("/dashboard");
}

export async function getMyWorkspaceId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("users").select("workspace_id").eq("id", user.id).single();
  return data?.workspace_id ?? null;
}
