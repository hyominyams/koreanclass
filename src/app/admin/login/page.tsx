import { redirect } from "next/navigation";
import { ShieldCheck, TriangleAlert } from "lucide-react";

import { AdminLoginForm } from "@/components/admin-login-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isAdminAuthenticated, isAdminConfigured } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_32%),linear-gradient(180deg,#f7f4ed_0%,#ffffff_55%,#f4f7fb_100%)] px-4 py-10">
      <Card className="w-full max-w-md rounded-[2rem] border border-white/70 bg-background/90 py-0 shadow-sm backdrop-blur">
        <CardHeader className="border-b px-6 py-6">
          <div className="mb-3 inline-flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ShieldCheck className="size-6" />
          </div>
          <CardTitle>교사용 관리 화면</CardTitle>
          <CardDescription>
            학생은 링크로 바로 쓰고, 교사는 비밀번호로만 모아보기 화면에
            들어갑니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 px-6 py-6">
          {!isAdminConfigured() && (
            <Alert variant="destructive">
              <TriangleAlert className="size-4" />
              <AlertTitle>관리자 비밀번호 설정 필요</AlertTitle>
              <AlertDescription>
                `.env.local`에 `ADMIN_PASSWORD`와 `ADMIN_SECRET`을 먼저 넣어
                주세요.
              </AlertDescription>
            </Alert>
          )}
          <AdminLoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
