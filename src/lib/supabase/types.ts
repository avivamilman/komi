export type UserRole = "owner" | "manager" | "agent" | "operations" | "accountant";
export type ReportingPeriodStatus = "open" | "processing" | "closed";
export type FileCategory = "commissions" | "sales" | "payments" | "policies" | "contracts";
export type UploadedFileStatus = "pending" | "queued" | "processing" | "done" | "failed";
export type ProcessingJobStatus = "queued" | "running" | "completed" | "failed" | "retrying";
export type ProcessingJobType = "normalize" | "reconcile" | "compare" | "validate_contract";
export type ContractStatus = "draft" | "active" | "superseded" | "expired";
export type PolicyStatus = "active" | "inactive" | "cancelled";
export type MatchCandidateStatus = "pending" | "matched" | "conflict" | "rejected";

// Supabase GenericTable requires Relationships field — use this helper for every table.
type Tbl<R extends Record<string, unknown>, I extends Record<string, unknown>, U extends Record<string, unknown>> = {
  Row: R;
  Insert: I;
  Update: U;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      workspaces: Tbl<
        { id: string; name: string; created_at: string },
        { id?: string; name: string; created_at?: string },
        { id?: string; name?: string; created_at?: string }
      >;
      users: Tbl<
        { id: string; workspace_id: string; email: string; role: UserRole; full_name: string | null; onboarding_completed: boolean; created_at: string },
        { id: string; workspace_id: string; email: string; role?: UserRole; full_name?: string | null; onboarding_completed?: boolean; created_at?: string },
        { id?: string; workspace_id?: string; email?: string; role?: UserRole; full_name?: string | null; onboarding_completed?: boolean; created_at?: string }
      >;
      insurance_companies: Tbl<
        { id: string; workspace_id: string; name: string; code: string; logo_url: string | null; active: boolean; created_at: string },
        { id?: string; workspace_id: string; name: string; code: string; logo_url?: string | null; active?: boolean; created_at?: string },
        { id?: string; workspace_id?: string; name?: string; code?: string; logo_url?: string | null; active?: boolean; created_at?: string }
      >;
      reporting_periods: Tbl<
        { id: string; workspace_id: string; year: number; month: number; status: ReportingPeriodStatus; created_at: string },
        { id?: string; workspace_id: string; year: number; month: number; status?: ReportingPeriodStatus; created_at?: string },
        { id?: string; workspace_id?: string; year?: number; month?: number; status?: ReportingPeriodStatus; created_at?: string }
      >;
      company_file_definitions: Tbl<
        { id: string; workspace_id: string; company_id: string; category: FileCategory; expected_columns_json: Record<string, unknown> | null; optional_columns_json: Record<string, unknown> | null; validation_rules_json: Record<string, unknown> | null; version: number; active: boolean; created_at: string; updated_at: string },
        { id?: string; workspace_id: string; company_id: string; category: FileCategory; expected_columns_json?: Record<string, unknown> | null; optional_columns_json?: Record<string, unknown> | null; validation_rules_json?: Record<string, unknown> | null; version?: number; active?: boolean; created_at?: string; updated_at?: string },
        { id?: string; workspace_id?: string; company_id?: string; category?: FileCategory; expected_columns_json?: Record<string, unknown> | null; optional_columns_json?: Record<string, unknown> | null; validation_rules_json?: Record<string, unknown> | null; version?: number; active?: boolean; created_at?: string; updated_at?: string }
      >;
      contracts: Tbl<
        { id: string; workspace_id: string; company_id: string; version_number: number; effective_date: string | null; expiry_date: string | null; file_path: string | null; status: ContractStatus; superseded_by_id: string | null; created_at: string },
        { id?: string; workspace_id: string; company_id: string; version_number?: number; effective_date?: string | null; expiry_date?: string | null; file_path?: string | null; status?: ContractStatus; superseded_by_id?: string | null; created_at?: string },
        { id?: string; workspace_id?: string; company_id?: string; version_number?: number; effective_date?: string | null; expiry_date?: string | null; file_path?: string | null; status?: ContractStatus; superseded_by_id?: string | null; created_at?: string }
      >;
      contract_rules: Tbl<
        { id: string; contract_id: string; product_type: string; commission_rate: number; conditions_json: Record<string, unknown> | null; approved_by: string | null; approved_at: string | null; created_at: string },
        { id?: string; contract_id: string; product_type: string; commission_rate: number; conditions_json?: Record<string, unknown> | null; approved_by?: string | null; approved_at?: string | null; created_at?: string },
        { id?: string; contract_id?: string; product_type?: string; commission_rate?: number; conditions_json?: Record<string, unknown> | null; approved_by?: string | null; approved_at?: string | null; created_at?: string }
      >;
      families: Tbl<
        { id: string; workspace_id: string; name: string; primary_client_id: string | null; created_at: string },
        { id?: string; workspace_id: string; name: string; primary_client_id?: string | null; created_at?: string },
        { id?: string; workspace_id?: string; name?: string; primary_client_id?: string | null; created_at?: string }
      >;
      family_memberships: Tbl<
        { id: string; family_id: string; client_id: string; relationship: string; joined_at: string | null; left_at: string | null; created_at: string },
        { id?: string; family_id: string; client_id: string; relationship?: string; joined_at?: string | null; left_at?: string | null; created_at?: string },
        { id?: string; family_id?: string; client_id?: string; relationship?: string; joined_at?: string | null; left_at?: string | null; created_at?: string }
      >;
      clients: Tbl<
        { id: string; workspace_id: string; name: string; id_number: string | null; phone: string | null; email: string | null; family_id: string | null; created_at: string },
        { id?: string; workspace_id: string; name: string; id_number?: string | null; phone?: string | null; email?: string | null; family_id?: string | null; created_at?: string },
        { id?: string; workspace_id?: string; name?: string; id_number?: string | null; phone?: string | null; email?: string | null; family_id?: string | null; created_at?: string }
      >;
      external_references: Tbl<
        { id: string; workspace_id: string; entity_type: string; entity_id: string; system_name: string; external_id: string; metadata_json: Record<string, unknown> | null; last_synced_at: string | null; created_at: string },
        { id?: string; workspace_id: string; entity_type: string; entity_id: string; system_name: string; external_id: string; metadata_json?: Record<string, unknown> | null; last_synced_at?: string | null; created_at?: string },
        { id?: string; workspace_id?: string; entity_type?: string; entity_id?: string; system_name?: string; external_id?: string; metadata_json?: Record<string, unknown> | null; last_synced_at?: string | null; created_at?: string }
      >;
      products: Tbl<
        { id: string; workspace_id: string; company_id: string; name: string; type: string; code: string | null; created_at: string },
        { id?: string; workspace_id: string; company_id: string; name: string; type: string; code?: string | null; created_at?: string },
        { id?: string; workspace_id?: string; company_id?: string; name?: string; type?: string; code?: string | null; created_at?: string }
      >;
      policies: Tbl<
        { id: string; workspace_id: string; client_id: string; company_id: string; product_id: string | null; policy_number: string; status: PolicyStatus; start_date: string | null; end_date: string | null; premium: number | null; created_at: string },
        { id?: string; workspace_id: string; client_id: string; company_id: string; product_id?: string | null; policy_number: string; status?: PolicyStatus; start_date?: string | null; end_date?: string | null; premium?: number | null; created_at?: string },
        { id?: string; workspace_id?: string; client_id?: string; company_id?: string; product_id?: string | null; policy_number?: string; status?: PolicyStatus; start_date?: string | null; end_date?: string | null; premium?: number | null; created_at?: string }
      >;
      policy_history: Tbl<
        { id: string; policy_id: string; period_id: string; snapshot_json: Record<string, unknown>; changed_fields_json: Record<string, unknown> | null; recorded_at: string },
        { id?: string; policy_id: string; period_id: string; snapshot_json: Record<string, unknown>; changed_fields_json?: Record<string, unknown> | null; recorded_at?: string },
        { id?: string; policy_id?: string; period_id?: string; snapshot_json?: Record<string, unknown>; changed_fields_json?: Record<string, unknown> | null; recorded_at?: string }
      >;
      client_match_candidates: Tbl<
        { id: string; workspace_id: string; source_file_id: string | null; raw_name: string | null; raw_id_number: string | null; raw_phone: string | null; matched_client_id: string | null; match_score: number | null; match_method: string | null; status: MatchCandidateStatus; resolved_by: string | null; resolved_at: string | null; created_at: string },
        { id?: string; workspace_id: string; source_file_id?: string | null; raw_name?: string | null; raw_id_number?: string | null; raw_phone?: string | null; matched_client_id?: string | null; match_score?: number | null; match_method?: string | null; status?: MatchCandidateStatus; resolved_by?: string | null; resolved_at?: string | null; created_at?: string },
        { id?: string; workspace_id?: string; source_file_id?: string | null; raw_name?: string | null; raw_id_number?: string | null; raw_phone?: string | null; matched_client_id?: string | null; match_score?: number | null; match_method?: string | null; status?: MatchCandidateStatus; resolved_by?: string | null; resolved_at?: string | null; created_at?: string }
      >;
      audit_logs: Tbl<
        { id: string; workspace_id: string; user_id: string | null; action: string; entity_type: string; entity_id: string | null; details_json: Record<string, unknown> | null; created_at: string },
        { id?: string; workspace_id: string; user_id?: string | null; action: string; entity_type: string; entity_id?: string | null; details_json?: Record<string, unknown> | null; created_at?: string },
        { id?: string; workspace_id?: string; user_id?: string | null; action?: string; entity_type?: string; entity_id?: string | null; details_json?: Record<string, unknown> | null; created_at?: string }
      >;
      uploaded_files: Tbl<
        { id: string; workspace_id: string; company_id: string; period_id: string; category: FileCategory; file_name: string; file_size: number; mime_type: string; storage_path: string; status: UploadedFileStatus; uploaded_by: string; uploaded_at: string; file_definition_id: string | null },
        { id?: string; workspace_id: string; company_id: string; period_id: string; category: FileCategory; file_name: string; file_size: number; mime_type: string; storage_path: string; status?: UploadedFileStatus; uploaded_by: string; uploaded_at?: string; file_definition_id?: string | null },
        { id?: string; workspace_id?: string; company_id?: string; period_id?: string; category?: FileCategory; file_name?: string; file_size?: number; mime_type?: string; storage_path?: string; status?: UploadedFileStatus; uploaded_by?: string; uploaded_at?: string; file_definition_id?: string | null }
      >;
      processing_jobs: Tbl<
        { id: string; workspace_id: string; file_id: string; job_type: ProcessingJobType; status: ProcessingJobStatus; started_at: string | null; completed_at: string | null; error_message: string | null; retry_count: number; result_summary_json: Record<string, unknown> | null; created_at: string },
        { id?: string; workspace_id: string; file_id: string; job_type?: ProcessingJobType; status?: ProcessingJobStatus; started_at?: string | null; completed_at?: string | null; error_message?: string | null; retry_count?: number; result_summary_json?: Record<string, unknown> | null; created_at?: string },
        { id?: string; workspace_id?: string; file_id?: string; job_type?: ProcessingJobType; status?: ProcessingJobStatus; started_at?: string | null; completed_at?: string | null; error_message?: string | null; retry_count?: number; result_summary_json?: Record<string, unknown> | null; created_at?: string }
      >;
    };
    Views: Record<string, never>;
    Functions: {
      get_my_workspace_id: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
    Enums: {
      user_role: UserRole;
      reporting_period_status: ReportingPeriodStatus;
    };
  };
};
