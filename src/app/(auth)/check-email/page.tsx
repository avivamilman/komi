import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CheckEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <CardTitle className="text-xl">בדוק את האימייל שלך</CardTitle>
          <CardDescription>
            שלחנו קישור אישור לכתובת האימייל שסיפקת.
            לחץ על הקישור כדי להפעיל את החשבון שלך.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500">
            לא קיבלת אימייל? בדוק את תיקיית ה-Spam, או
          </p>
          <Link href="/signup">
            <Button variant="outline" className="w-full">נסה להירשם שוב</Button>
          </Link>
          <Link href="/login" className="block text-sm text-blue-600 hover:underline">
            חזור לכניסה
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
