import { getUploadHistory } from "@/actions/upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatFileSize, FILE_CATEGORIES, HEBREW_MONTHS } from "@/lib/upload-config";

const STATUS_LABELS: Record<string, string> = {
  pending:    "ממתין",
  queued:     "בתור",
  running:    "מעבד",
  processing: "מעבד",
  completed:  "הושלם",
  done:       "הושלם",
  failed:     "נכשל",
  retrying:   "מנסה שוב",
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending:    "outline",
  queued:     "secondary",
  running:    "secondary",
  processing: "secondary",
  completed:  "default",
  done:       "default",
  failed:     "destructive",
  retrying:   "secondary",
};

function categoryLabel(cat: string) {
  return FILE_CATEGORIES.find((c) => c.value === cat)?.label ?? cat;
}

function periodLabel(year: number, month: number) {
  return `${HEBREW_MONTHS[month]} ${year}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("he-IL", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export async function UploadHistory() {
  const history = await getUploadHistory();

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>היסטוריית העלאות</CardTitle></CardHeader>
        <CardContent>
          <p className="text-gray-500 text-sm text-center py-8">
            לא הועלו קבצים עדיין
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>היסטוריית העלאות</CardTitle>
        <p className="text-sm text-gray-500">{history.length} קבצים אחרונים</p>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {history.map((item) => {
            const job = Array.isArray(item.processing_jobs) ? item.processing_jobs[0] : item.processing_jobs;
            const jobStatus = job?.status ?? item.status;
            const company = Array.isArray(item.insurance_companies)
              ? item.insurance_companies[0]
              : item.insurance_companies;
            const period = Array.isArray(item.reporting_periods)
              ? item.reporting_periods[0]
              : item.reporting_periods;

            return (
              <div key={item.id} className="py-4 flex items-start justify-between gap-4">
                <div className="min-w-0 space-y-1">
                  <p className="font-medium text-gray-900 truncate">{item.file_name}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                    {company && <span>{company.name}</span>}
                    {period && <span>•  {periodLabel(period.year, period.month)}</span>}
                    <span>• {categoryLabel(item.category)}</span>
                    <span>• {formatFileSize(item.file_size)}</span>
                  </div>
                  <p className="text-xs text-gray-400">{formatDate(item.uploaded_at)}</p>
                  {job?.error_message && (
                    <p className="text-xs text-red-600 mt-1">{job.error_message}</p>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <Badge variant={STATUS_VARIANT[jobStatus] ?? "outline"}>
                    {STATUS_LABELS[jobStatus] ?? jobStatus}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
