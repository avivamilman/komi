-- ============================================================
-- KOMI Phase 1 — File Upload Infrastructure
-- ============================================================

-- ============================================================
-- Uploaded Files
-- ============================================================
CREATE TABLE uploaded_files (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id       UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  company_id         UUID NOT NULL REFERENCES insurance_companies(id),
  period_id          UUID NOT NULL REFERENCES reporting_periods(id),
  category           TEXT NOT NULL,  -- commissions | sales | payments | policies | contracts
  file_name          TEXT NOT NULL,
  file_size          BIGINT NOT NULL,
  mime_type          TEXT NOT NULL,
  storage_path       TEXT NOT NULL,
  status             TEXT NOT NULL DEFAULT 'pending',  -- pending | queued | processing | done | failed
  uploaded_by        UUID NOT NULL REFERENCES users(id),
  uploaded_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  file_definition_id UUID REFERENCES company_file_definitions(id)
);

CREATE INDEX idx_uploaded_files_workspace_id ON uploaded_files(workspace_id);
CREATE INDEX idx_uploaded_files_period_id    ON uploaded_files(period_id);
CREATE INDEX idx_uploaded_files_company_id   ON uploaded_files(company_id);
CREATE INDEX idx_uploaded_files_uploaded_at  ON uploaded_files(uploaded_at DESC);

-- ============================================================
-- Processing Jobs
-- ============================================================
CREATE TABLE processing_jobs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id        UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  file_id             UUID NOT NULL REFERENCES uploaded_files(id) ON DELETE CASCADE,
  job_type            TEXT NOT NULL DEFAULT 'normalize',  -- normalize | reconcile | compare | validate_contract
  status              TEXT NOT NULL DEFAULT 'queued',     -- queued | running | completed | failed | retrying
  started_at          TIMESTAMPTZ,
  completed_at        TIMESTAMPTZ,
  error_message       TEXT,
  retry_count         INTEGER NOT NULL DEFAULT 0,
  result_summary_json JSONB,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_processing_jobs_workspace_id ON processing_jobs(workspace_id);
CREATE INDEX idx_processing_jobs_file_id      ON processing_jobs(file_id);
CREATE INDEX idx_processing_jobs_status       ON processing_jobs(status);

-- ============================================================
-- Back-fill FK: client_match_candidates.source_file_id
-- ============================================================
ALTER TABLE client_match_candidates
  ADD CONSTRAINT fk_match_source_file
  FOREIGN KEY (source_file_id) REFERENCES uploaded_files(id) ON DELETE SET NULL;

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE uploaded_files  ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY uploaded_files_all ON uploaded_files
  FOR ALL USING (workspace_id = public.get_my_workspace_id())
  WITH CHECK (workspace_id = public.get_my_workspace_id());

CREATE POLICY processing_jobs_all ON processing_jobs
  FOR ALL USING (workspace_id = public.get_my_workspace_id())
  WITH CHECK (workspace_id = public.get_my_workspace_id());
