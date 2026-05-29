"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { recordUpload } from "@/actions/upload";
import {
  validateFile,
  buildStoragePath,
  formatFileSize,
  FILE_CATEGORIES,
  HEBREW_MONTHS,
} from "@/lib/upload-config";
import type { FileCategory } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Company {
  id: string;
  name: string;
  code: string;
}

interface UploadFormProps {
  companies: Company[];
  workspaceId: string;
}

type UploadState =
  | { type: "idle" }
  | { type: "uploading"; progress: number }
  | { type: "success"; fileName: string }
  | { type: "error"; message: string };

const currentYear = new Date().getFullYear();
const YEARS = [currentYear - 1, currentYear, currentYear + 1];

export function UploadForm({ companies, workspaceId }: UploadFormProps) {
  const [companyId, setCompanyId] = useState("");
  const [year, setYear] = useState(String(currentYear));
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [category, setCategory] = useState<FileCategory | "">("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [state, setState] = useState<UploadState>({ type: "idle" });
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(selected: File) {
    const err = validateFile(selected);
    setFileError(err);
    setFile(err ? null : selected);
    if (state.type === "error") setState({ type: "idle" });
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFileSelect(dropped);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!companyId || !year || !month || !category || !file) return;

    setState({ type: "uploading", progress: 0 });

    const storagePath = buildStoragePath(workspaceId, Number(year), Number(month), companyId, file.name);
    const supabase = createClient();

    // Upload to Supabase Storage
    const { error: storageError } = await supabase.storage
      .from("files")
      .upload(storagePath, file, { upsert: false, contentType: file.type || "application/octet-stream" });

    if (storageError) {
      setState({ type: "error", message: `שגיאת העלאה: ${storageError.message}` });
      return;
    }

    setState({ type: "uploading", progress: 80 });

    // Record in DB
    const result = await recordUpload({
      companyId,
      year: Number(year),
      month: Number(month),
      category: category as FileCategory,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type || "application/octet-stream",
      storagePath,
    });

    if ("error" in result) {
      // Attempt to clean up storage
      await supabase.storage.from("files").remove([storagePath]);
      setState({ type: "error", message: result.error });
      return;
    }

    setState({ type: "success", fileName: file.name });
    setFile(null);
    setCategory("");
    if (inputRef.current) inputRef.current.value = "";
  }

  const isValid = companyId && year && month && category && file && !fileError;
  const isUploading = state.type === "uploading";

  return (
    <Card>
      <CardHeader>
        <CardTitle>העלאת קובץ חדש</CardTitle>
      </CardHeader>
      <CardContent>
        {state.type === "success" && (
          <div className="mb-4 p-3 rounded-md bg-green-50 text-green-700 text-sm flex items-center justify-between">
            <span>✓ הקובץ "{state.fileName}" הועלה בהצלחה</span>
            <button onClick={() => setState({ type: "idle" })} className="text-green-600 hover:text-green-800">✕</button>
          </div>
        )}
        {state.type === "error" && (
          <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 text-sm flex items-center justify-between">
            <span>{state.message}</span>
            <button onClick={() => setState({ type: "idle" })} className="text-red-600 hover:text-red-800">✕</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Company */}
          <div className="space-y-2">
            <Label>חברת ביטוח</Label>
            <Select value={companyId} onValueChange={(v) => setCompanyId(v ?? "")} disabled={isUploading}>
              <SelectTrigger>
                <SelectValue placeholder="בחר חברה..." />
              </SelectTrigger>
              <SelectContent>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} <span className="text-gray-400 text-xs">({c.code})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Period */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>שנה</Label>
              <Select value={year} onValueChange={(v) => setYear(v ?? String(currentYear))} disabled={isUploading}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {YEARS.map((y) => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>חודש</Label>
              <Select value={month} onValueChange={(v) => setMonth(v ?? "1")} disabled={isUploading}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(HEBREW_MONTHS).map(([num, name]) => (
                    <SelectItem key={num} value={num}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>קטגוריה</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as FileCategory)} disabled={isUploading}>
              <SelectTrigger>
                <SelectValue placeholder="בחר קטגוריה..." />
              </SelectTrigger>
              <SelectContent>
                {FILE_CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* File Drop Zone */}
          <div className="space-y-2">
            <Label>קובץ</Label>
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
                ${isDragging ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"}
                ${isUploading ? "opacity-50 pointer-events-none" : ""}
              `}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
              />
              {file ? (
                <div className="space-y-1">
                  <p className="font-medium text-gray-800">{file.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                  <button
                    type="button"
                    className="text-xs text-red-500 hover:text-red-700 mt-1"
                    onClick={(e) => { e.stopPropagation(); setFile(null); if (inputRef.current) inputRef.current.value = ""; }}
                  >
                    הסר קובץ
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-gray-600">גרור קובץ לכאן או לחץ לבחירה</p>
                  <p className="text-xs text-gray-400">Excel (.xlsx, .xls) או CSV — עד 50MB</p>
                </div>
              )}
            </div>
            {fileError && <p className="text-sm text-red-600">{fileError}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={!isValid || isUploading}>
            {isUploading ? "מעלה..." : "העלה קובץ"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
