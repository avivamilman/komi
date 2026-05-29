import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("users")
    .select("full_name, workspace_id")
    .eq("id", user!.id)
    .single();

  const { data: companies } = await supabase
    .from("insurance_companies")
    .select("id, name, code, active")
    .eq("workspace_id", profile?.workspace_id ?? "")
    .order("created_at");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          שלום, {profile?.full_name ?? user?.email}
        </h1>
        <p className="text-gray-500 mt-1">ברוך הבא ל-KOMI</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">חברות ביטוח</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{companies?.length ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">עמלות החודש</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-400">—</p>
            <p className="text-xs text-gray-400 mt-1">זמין לאחר העלאת קבצים</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">פוליסות פעילות</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-400">—</p>
            <p className="text-xs text-gray-400 mt-1">זמין לאחר העלאת קבצים</p>
          </CardContent>
        </Card>
      </div>

      {companies && companies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>חברות ביטוח</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {companies.map((c) => (
                <div key={c.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-sm text-gray-500">{c.code}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${c.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {c.active ? "פעיל" : "לא פעיל"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
