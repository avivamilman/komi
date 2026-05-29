"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { FileCategory } from "@/lib/supabase/types";

export interface RecordUploadInput {
  companyId: string;
  year: number;
  month: number;
  category: FileCategory;
  fileName: string;
  fileSize: number;
  mimeType: string;
  storagePath: string;
}

export async function getOrCreatePeriod(
  workspaceId: string,
  year: number,
  month: number
): Promise<{ periodId: string } | { error: string }> {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("reporting_periods")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("year", year)
    .eq("month", month)
    .single();

  if (existing) return { periodId: existing.id };

  const { data: created, error } = await supabase
    .from("reporting_periods")
    .insert({ workspace_id: workspaceId, year, month, status: "open" })
    .select("id")
    .single();

  if (error) return { error: error.message };
  return { periodId: created.id };
}

export async function recordUpload(
  input: RecordUploadInput
): Promise<{ fileId: string; jobId: string } | { error: string }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "לא מחובר" };

  const { data: profile } = await supabase
    .from("users")
    .select("workspace_id")
    .eq("id", user.id)
    .single();

  if (!profile?.workspace_id) return { error: "לא נמצא workspace" };

  const workspaceId = profile.workspace_id;

  // Find or create reporting period
  const periodResult = await getOrCreatePeriod(workspaceId, input.year, input.month);
  if ("error" in periodResult) return { error: periodResult.error };

  // Create uploaded_files record
  const { data: fileRecord, error: fileError } = await supabase
    .from("uploaded_files")
    .insert({
      workspace_id: workspaceId,
      company_id: input.companyId,
      period_id: periodResult.periodId,
      category: input.category,
      file_name: input.fileName,
      file_size: input.fileSize,
      mime_type: input.mimeType,
      storage_path: input.storagePath,
      status: "queued",
      uploaded_by: user.id,
    })
    .select("id")
    .single();

  if (fileError) return { error: fileError.message };

  // Create processing_jobs record
  const { data: jobRecord, error: jobError } = await supabase
    .from("processing_jobs")
    .insert({
      workspace_id: workspaceId,
      file_id: fileRecord.id,
      job_type: "normalize",
      status: "queued",
    })
    .select("id")
    .single();

  if (jobError) return { error: jobError.message };

  revalidatePath("/upload");
  return { fileId: fileRecord.id, jobId: jobRecord.id };
}

export async function getUploadHistory() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: profile } = await supabase
    .from("users")
    .select("workspace_id")
    .eq("id", user.id)
    .single();

  if (!profile?.workspace_id) return [];

  const { data } = await supabase
    .from("uploaded_files")
    .select(`
      id, file_name, file_size, category, status, uploaded_at, storage_path,
      insurance_companies ( id, name, code ),
      reporting_periods ( id, year, month ),
      processing_jobs ( id, status, job_type, error_message, created_at )
    `)
    .eq("workspace_id", profile.workspace_id)
    .order("uploaded_at", { ascending: false })
    .limit(50);

  return data ?? [];
}

export async function getWorkspaceCompanies() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: profile } = await supabase
    .from("users")
    .select("workspace_id")
    .eq("id", user.id)
    .single();

  if (!profile?.workspace_id) return [];

  const { data } = await supabase
    .from("insurance_companies")
    .select("id, name, code")
    .eq("workspace_id", profile.workspace_id)
    .eq("active", true)
    .order("name");

  return data ?? [];
}
