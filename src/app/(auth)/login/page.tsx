"use client";

import { useState } from "react";
import Link from "next/link";
import { login } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">KOMI</CardTitle>
          <CardDescription>התחבר לחשבון שלך</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">אימייל</Label>
              <Input id="email" name="email" type="email" required placeholder="name@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">סיסמה</Label>
              <Input id="password" name="password" type="password" required placeholder="••••••••" />
            </div>
            {error && (
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "מתחבר..." : "כניסה"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm space-y-2">
            <p>
              <Link href="/reset-password" className="text-blue-600 hover:underline">
                שכחת סיסמה?
              </Link>
            </p>
            <p>
              אין לך חשבון?{" "}
              <Link href="/signup" className="text-blue-600 hover:underline">
                הרשם כאן
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
