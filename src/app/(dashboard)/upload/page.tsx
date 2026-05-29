import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceCompanies } from "@/actions/upload";
import { UploadForm } from "@/components/upload/upload-form";
import { UploadHistory } from "@/components/upload/upload-history";

export default async function UploadPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("workspace_id")
    .eq("id", user.id)
    .single();

  if (!profile?.workspace_id) redirect("/onboarding");

  const companies = await getWorkspaceCompanies();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">העלאת קבצים</h1>
        <p className="text-gray-500 mt-1">
          העלה קבצי עמלות, מכירות ופוליסות מחברות הביטוח
        </p>
      </div>

      {companies.length === 0 ? (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 text-center">
          <p className="text-yellow-800 font-medium">לא הוגדרו חברות ביטוח</p>
          <p className="text-yellow-700 text-sm mt-1">
            יש להוסיף חברת ביטוח לפני העלאת קבצים
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <UploadForm companies={companies} workspaceId={profile.workspace_id} />
          <UploadHistory />
        </div>
      )}
    </div>
  );
}
