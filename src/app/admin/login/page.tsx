import Link from "next/link";
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
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.12),transparent_26%),radial-gradient(circle_at_bottom,rgba(14,116,144,0.12),transparent_28%),linear-gradient(180deg,#f4f0e8_0%,#fbfaf7_52%,#edf3f7_100%)] px-4 py-10">
      <Card className="w-full max-w-md overflow-hidden rounded-[2rem] border border-white/70 bg-white/92 py-0 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur">
        <CardHeader className="border-b border-slate-200/80 px-6 py-6">
          <div className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl bg-slate-900 text-white">
            <ShieldCheck className="size-6" />
          </div>
          <CardTitle className="text-xl tracking-tight">관리자 로그인</CardTitle>
          <CardDescription className="text-sm leading-6">
            Supabase Authentication에 등록된 관리자 계정으로 로그인합니다. 로그인에
            성공하면 교사 관리자 페이지로 이동합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 px-6 py-6">
          {!isAdminConfigured() ? (
            <Alert variant="destructive">
              <TriangleAlert className="size-4" />
              <AlertTitle>Supabase 환경변수 설정이 필요합니다.</AlertTitle>
              <AlertDescription>
                `NEXT_PUBLIC_SUPABASE_URL`과 `NEXT_PUBLIC_SUPABASE_ANON_KEY`를 먼저
                설정해 주세요.
              </AlertDescription>
            </Alert>
          ) : null}

          <AdminLoginForm />

          <Link
            href="/"
            className="inline-flex w-full items-center justify-center rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            처음 페이지로 돌아가기
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
