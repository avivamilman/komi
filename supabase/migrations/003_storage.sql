-- ============================================================
-- Supabase Storage — KOMI files bucket
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'files',
  'files',
  false,  -- private bucket
  52428800,  -- 50 MB per file
  ARRAY[
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',  -- .xlsx
    'application/vnd.ms-excel',                                            -- .xls
    'text/csv',
    'application/csv',
    'application/pdf'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: users can only access files in their workspace folder
CREATE POLICY storage_files_select ON storage.objects
  FOR SELECT USING (
    bucket_id = 'files'
    AND (storage.foldername(name))[1] = auth.workspace_id()::text
  );

CREATE POLICY storage_files_insert ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'files'
    AND (storage.foldername(name))[1] = auth.workspace_id()::text
  );

CREATE POLICY storage_files_delete ON storage.objects
  FOR DELETE USING (
    bucket_id = 'files'
    AND (storage.foldername(name))[1] = auth.workspace_id()::text
  );
