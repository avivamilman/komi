export type UserRole = "owner" | "manager" | "agent" | "operations" | "accountant";

export type ReportingPeriodStatus = "open" | "processing" | "closed";

export type Database = {
  public: {
    Tables: {
      workspaces: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          workspace_id: string;
          email: string;
          role: UserRole;
          full_name: string | null;
          onboarding_completed: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          workspace_id: string;
          email: string;
          role?: UserRole;
          full_name?: string | null;
          onboarding_completed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          email?: string;
          role?: UserRole;
          full_name?: string | null;
          onboarding_completed?: boolean;
          created_at?: string;
        };
      };
      insurance_companies: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          code: string;
          logo_url: string | null;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          code: string;
          logo_url?: string | null;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          name?: string;
          code?: string;
          logo_url?: string | null;
          active?: boolean;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      reporting_period_status: ReportingPeriodStatus;
    };
  };
};
