-- ============================================================
-- KOMI RLS Policies — Phase 0
-- Every table uses workspace_id isolation.
-- Helper function checks the calling user's workspace_id.
-- ============================================================

-- Helper: return the workspace_id of the currently authenticated user
CREATE OR REPLACE FUNCTION public.get_my_workspace_id()
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT workspace_id FROM public.users WHERE id = auth.uid()
$$;

-- ============================================================
-- Enable RLS on all tables
-- ============================================================
ALTER TABLE workspaces             ENABLE ROW LEVEL SECURITY;
ALTER TABLE users                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_companies    ENABLE ROW LEVEL SECURITY;
ALTER TABLE reporting_periods      ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_file_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts              ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_rules         ENABLE ROW LEVEL SECURITY;
ALTER TABLE families               ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_memberships     ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients                ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_references    ENABLE ROW LEVEL SECURITY;
ALTER TABLE products               ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies               ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_history         ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_match_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs             ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- workspaces — user sees only their own workspace
-- ============================================================
CREATE POLICY workspaces_select ON workspaces
  FOR SELECT USING (id = public.get_my_workspace_id());

CREATE POLICY workspaces_insert ON workspaces
  FOR INSERT WITH CHECK (true);

CREATE POLICY workspaces_update ON workspaces
  FOR UPDATE USING (id = public.get_my_workspace_id());

-- ============================================================
-- users — scoped to workspace
-- ============================================================
CREATE POLICY users_select ON users
  FOR SELECT USING (workspace_id = public.get_my_workspace_id());

CREATE POLICY users_insert ON users
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY users_update ON users
  FOR UPDATE USING (id = auth.uid());

-- ============================================================
-- insurance_companies
-- ============================================================
CREATE POLICY companies_all ON insurance_companies
  FOR ALL USING (workspace_id = public.get_my_workspace_id())
  WITH CHECK (workspace_id = public.get_my_workspace_id());

-- ============================================================
-- reporting_periods
-- ============================================================
CREATE POLICY periods_all ON reporting_periods
  FOR ALL USING (workspace_id = public.get_my_workspace_id())
  WITH CHECK (workspace_id = public.get_my_workspace_id());

-- ============================================================
-- company_file_definitions
-- ============================================================
CREATE POLICY file_defs_all ON company_file_definitions
  FOR ALL USING (workspace_id = public.get_my_workspace_id())
  WITH CHECK (workspace_id = public.get_my_workspace_id());

-- ============================================================
-- contracts
-- ============================================================
CREATE POLICY contracts_all ON contracts
  FOR ALL USING (workspace_id = public.get_my_workspace_id())
  WITH CHECK (workspace_id = public.get_my_workspace_id());

-- ============================================================
-- contract_rules — via contract's workspace
-- ============================================================
CREATE POLICY contract_rules_all ON contract_rules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM contracts c
      WHERE c.id = contract_id
        AND c.workspace_id = public.get_my_workspace_id()
    )
  );

-- ============================================================
-- families
-- ============================================================
CREATE POLICY families_all ON families
  FOR ALL USING (workspace_id = public.get_my_workspace_id())
  WITH CHECK (workspace_id = public.get_my_workspace_id());

-- ============================================================
-- family_memberships — via family's workspace
-- ============================================================
CREATE POLICY memberships_all ON family_memberships
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM families f
      WHERE f.id = family_id
        AND f.workspace_id = public.get_my_workspace_id()
    )
  );

-- ============================================================
-- clients
-- ============================================================
CREATE POLICY clients_all ON clients
  FOR ALL USING (workspace_id = public.get_my_workspace_id())
  WITH CHECK (workspace_id = public.get_my_workspace_id());

-- ============================================================
-- external_references
-- ============================================================
CREATE POLICY ext_refs_all ON external_references
  FOR ALL USING (workspace_id = public.get_my_workspace_id())
  WITH CHECK (workspace_id = public.get_my_workspace_id());

-- ============================================================
-- products
-- ============================================================
CREATE POLICY products_all ON products
  FOR ALL USING (workspace_id = public.get_my_workspace_id())
  WITH CHECK (workspace_id = public.get_my_workspace_id());

-- ============================================================
-- policies
-- ============================================================
CREATE POLICY policies_all ON policies
  FOR ALL USING (workspace_id = public.get_my_workspace_id())
  WITH CHECK (workspace_id = public.get_my_workspace_id());

-- ============================================================
-- policy_history — via policy's workspace
-- ============================================================
CREATE POLICY policy_history_all ON policy_history
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM policies p
      WHERE p.id = policy_id
        AND p.workspace_id = public.get_my_workspace_id()
    )
  );

-- ============================================================
-- client_match_candidates
-- ============================================================
CREATE POLICY match_candidates_all ON client_match_candidates
  FOR ALL USING (workspace_id = public.get_my_workspace_id())
  WITH CHECK (workspace_id = public.get_my_workspace_id());

-- ============================================================
-- audit_logs
-- ============================================================
CREATE POLICY audit_logs_select ON audit_logs
  FOR SELECT USING (workspace_id = public.get_my_workspace_id());

CREATE POLICY audit_logs_insert ON audit_logs
  FOR INSERT WITH CHECK (workspace_id = public.get_my_workspace_id());
