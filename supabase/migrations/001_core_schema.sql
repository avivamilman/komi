-- ============================================================
-- KOMI Core Schema — Phase 0
-- ============================================================

-- Enums
CREATE TYPE user_role AS ENUM ('owner', 'manager', 'agent', 'operations', 'accountant');
CREATE TYPE reporting_period_status AS ENUM ('open', 'processing', 'closed');

-- ============================================================
-- Workspaces
-- ============================================================
CREATE TABLE workspaces (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Users (extends auth.users)
-- ============================================================
CREATE TABLE users (
  id                    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id          UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  email                 TEXT NOT NULL,
  role                  user_role NOT NULL DEFAULT 'owner',
  full_name             TEXT,
  onboarding_completed  BOOLEAN NOT NULL DEFAULT false,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_workspace_id ON users(workspace_id);

-- ============================================================
-- Insurance Companies
-- ============================================================
CREATE TABLE insurance_companies (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  code          TEXT NOT NULL,
  logo_url      TEXT,
  active        BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, code)
);

CREATE INDEX idx_insurance_companies_workspace_id ON insurance_companies(workspace_id);

-- ============================================================
-- Reporting Periods
-- ============================================================
CREATE TABLE reporting_periods (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  year          INTEGER NOT NULL,
  month         INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  status        reporting_period_status NOT NULL DEFAULT 'open',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, year, month)
);

CREATE INDEX idx_reporting_periods_workspace_id ON reporting_periods(workspace_id);

-- ============================================================
-- Company File Definitions
-- ============================================================
CREATE TABLE company_file_definitions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id          UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  company_id            UUID NOT NULL REFERENCES insurance_companies(id) ON DELETE CASCADE,
  category              TEXT NOT NULL,   -- commissions | sales | payments | policies | contracts
  expected_columns_json JSONB,
  optional_columns_json JSONB,
  validation_rules_json JSONB,
  version               INTEGER NOT NULL DEFAULT 1,
  active                BOOLEAN NOT NULL DEFAULT true,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Contracts + Versioning
-- ============================================================
CREATE TABLE contracts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id     UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  company_id       UUID NOT NULL REFERENCES insurance_companies(id) ON DELETE CASCADE,
  version_number   INTEGER NOT NULL DEFAULT 1,
  effective_date   DATE,
  expiry_date      DATE,
  file_path        TEXT,
  status           TEXT NOT NULL DEFAULT 'draft',  -- draft | active | superseded | expired
  superseded_by_id UUID REFERENCES contracts(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_contracts_workspace_id ON contracts(workspace_id);
CREATE INDEX idx_contracts_company_id ON contracts(company_id);

-- ============================================================
-- Contract Rules
-- ============================================================
CREATE TABLE contract_rules (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id      UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  product_type     TEXT NOT NULL,
  commission_rate  NUMERIC(6,4) NOT NULL,   -- e.g. 0.0750 = 7.5%
  conditions_json  JSONB,
  approved_by      UUID REFERENCES users(id),
  approved_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Families
-- ============================================================
CREATE TABLE families (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id      UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  primary_client_id UUID,   -- FK added after clients table
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_families_workspace_id ON families(workspace_id);

-- ============================================================
-- Clients
-- ============================================================
CREATE TABLE clients (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id      UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  id_number         TEXT,
  phone             TEXT,
  email             TEXT,
  family_id         UUID REFERENCES families(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_clients_workspace_id ON clients(workspace_id);
CREATE INDEX idx_clients_id_number ON clients(workspace_id, id_number);

-- Back-fill FK
ALTER TABLE families ADD CONSTRAINT fk_families_primary_client
  FOREIGN KEY (primary_client_id) REFERENCES clients(id);

-- ============================================================
-- Family Memberships
-- ============================================================
CREATE TABLE family_memberships (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id    UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  client_id    UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL DEFAULT 'primary',  -- primary | spouse | child | parent | other
  joined_at    DATE,
  left_at      DATE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (family_id, client_id)
);

-- ============================================================
-- External References (CRM bridge)
-- ============================================================
CREATE TABLE external_references (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  entity_type   TEXT NOT NULL,   -- client | policy | company | family
  entity_id     UUID NOT NULL,
  system_name   TEXT NOT NULL,   -- surence | fireberry | salesforce | hubspot | custom
  external_id   TEXT NOT NULL,
  metadata_json JSONB,
  last_synced_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, entity_type, entity_id, system_name)
);

-- ============================================================
-- Products
-- ============================================================
CREATE TABLE products (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  company_id    UUID NOT NULL REFERENCES insurance_companies(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  type          TEXT NOT NULL,
  code          TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_workspace_id ON products(workspace_id);

-- ============================================================
-- Policies
-- ============================================================
CREATE TABLE policies (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id   UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  client_id      UUID NOT NULL REFERENCES clients(id),
  company_id     UUID NOT NULL REFERENCES insurance_companies(id),
  product_id     UUID REFERENCES products(id),
  policy_number  TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'active',  -- active | inactive | cancelled
  start_date     DATE,
  end_date       DATE,
  premium        NUMERIC(12,2),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, company_id, policy_number)
);

CREATE INDEX idx_policies_workspace_id ON policies(workspace_id);
CREATE INDEX idx_policies_client_id ON policies(client_id);

-- ============================================================
-- Policy History (snapshot per period)
-- ============================================================
CREATE TABLE policy_history (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id           UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
  period_id           UUID NOT NULL REFERENCES reporting_periods(id),
  snapshot_json       JSONB NOT NULL,
  changed_fields_json JSONB,
  recorded_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (policy_id, period_id)
);

-- ============================================================
-- Client Match Candidates
-- ============================================================
CREATE TABLE client_match_candidates (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id      UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  source_file_id    UUID,   -- FK to uploaded_files (added in Phase 1)
  raw_name          TEXT,
  raw_id_number     TEXT,
  raw_phone         TEXT,
  matched_client_id UUID REFERENCES clients(id),
  match_score       INTEGER CHECK (match_score BETWEEN 0 AND 100),
  match_method      TEXT,   -- exact | fuzzy | manual
  status            TEXT NOT NULL DEFAULT 'pending',  -- pending | matched | conflict | rejected
  resolved_by       UUID REFERENCES users(id),
  resolved_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Audit Logs
-- ============================================================
CREATE TABLE audit_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES users(id),
  action        TEXT NOT NULL,
  entity_type   TEXT NOT NULL,
  entity_id     UUID,
  details_json  JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_workspace_id ON audit_logs(workspace_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
