"use client";

import { useState } from "react";
import { bootstrapWorkspace } from "@/actions/workspace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [workspaceName, setWorkspaceName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleStep1(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = fd.get("workspace_name") as string;
    if (name.trim()) {
      setWorkspaceName(name.trim());
      setStep(2);
    }
  }

  async function handleStep2(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("workspace_name", workspaceName);
    const result = await bootstrapWorkspace(fd);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">KOMI</h1>
          <p className="text-gray-500 mt-2">הגדרת חשבון ראשונית</p>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm">
          <span className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}>1</span>
          <div className="h-px w-12 bg-gray-300" />
          <span className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}>2</span>
        </div>

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>שם הסוכנות / העסק</CardTitle>
              <CardDescription>זה יהיה שם ה-workspace שלך ב-KOMI</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStep1} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="workspace_name">שם הסוכנות</Label>
                  <Input
                    id="workspace_name"
                    name="workspace_name"
                    required
                    defaultValue={workspaceName}
                    placeholder="למשל: סוכנות ביטוח כהן"
                  />
                </div>
                <Button type="submit" className="w-full">המשך</Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>חברת ביטוח ראשונה</CardTitle>
              <CardDescription>
                Workspace: <strong>{workspaceName}</strong> — הוסף את חברת הביטוח הראשונה
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStep2} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">שם החברה</Label>
                  <Input
                    id="company_name"
                    name="company_name"
                    required
                    placeholder="למשל: מגדל ביטוח"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_code">קוד קצר</Label>
                  <Input
                    id="company_code"
                    name="company_code"
                    required
                    placeholder="למשל: MIGDAL"
                    maxLength={10}
                  />
                  <p className="text-xs text-gray-500">קוד ייחודי לזיהוי החברה (אותיות לועזיות)</p>
                </div>
                {error && (
                  <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>
                )}
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                    חזור
                  </Button>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? "שומר..." : "סיים הגדרה"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
