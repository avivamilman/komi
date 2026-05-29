export const ALLOWED_EXTENSIONS = [".xlsx", ".xls", ".csv"] as const;

export const ALLOWED_MIME_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/csv",
  "application/csv",
  "text/plain",
] as const;

export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

export const FILE_CATEGORIES = [
  { value: "commissions", label: "עמלות" },
  { value: "sales",       label: "מכירות" },
  { value: "payments",    label: "תשלומים" },
  { value: "policies",    label: "פוליסות" },
  { value: "contracts",   label: "חוזים" },
] as const;

export const HEBREW_MONTHS: Record<number, string> = {
  1: "ינואר", 2: "פברואר", 3: "מרץ", 4: "אפריל",
  5: "מאי", 6: "יוני", 7: "יולי", 8: "אוגוסט",
  9: "ספטמבר", 10: "אוקטובר", 11: "נובמבר", 12: "דצמבר",
};

export function validateFile(file: File): string | null {
  const ext = "." + file.name.split(".").pop()?.toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext as typeof ALLOWED_EXTENSIONS[number])) {
    return `סוג קובץ לא נתמך. מותר: ${ALLOWED_EXTENSIONS.join(", ")}`;
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `הקובץ גדול מדי. מקסימום: 50MB`;
  }
  return null;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function buildStoragePath(
  workspaceId: string,
  year: number,
  month: number,
  companyId: string,
  fileName: string
): string {
  // Sanitize filename: remove special chars, keep extension
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "xlsx";
  const base = fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9א-ת\-_]/g, "_")
    .slice(0, 80);
  const timestamp = Date.now();
  return `${workspaceId}/${year}/${String(month).padStart(2, "0")}/${companyId}/${base}_${timestamp}.${ext}`;
}
