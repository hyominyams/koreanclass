import Link from "next/link";
import { ArrowRight, BookOpenText, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getBoardMeta } from "@/lib/discussions";
import { getFirstTopicIdFromSource } from "@/lib/topics";

export const dynamic = "force-dynamic";

export default async function Home() {
  const board = getBoardMeta();
  const firstTopicId = await getFirstTopicIdFromSource();
  const studentHref = firstTopicId ? `/write/${firstTopicId}` : null;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(14,116,144,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.16),transparent_28%),linear-gradient(180deg,#f3efe7_0%,#fbfaf7_52%,#eef4f8_100%)]">
      <main className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10 md:px-6 lg:px-8">
        <div className="w-full space-y-8">
          <div className="max-w-3xl space-y-4">
            <Badge variant="secondary" className="rounded-full bg-slate-900 text-white">
              {board.title}
            </Badge>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
                학생 보드와 관리자 페이지를 여기서 나눠서 들어갑니다.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
                학생은 글을 작성하고 서로 반응할 수 있고, 관리자는 별도 로그인 후 주제와
                전체 보드 활동을 관리합니다.
              </p>
            </div>
          </div>

          <section className="grid gap-5 lg:grid-cols-2">
            <Card className="rounded-[2rem] border border-white/70 bg-white/92 py-0 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
              <CardHeader className="border-b border-slate-200/70 px-6 py-6">
                <div className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl bg-slate-900 text-white">
                  <BookOpenText className="size-6" />
                </div>
                <CardTitle className="text-2xl tracking-tight">학생 페이지</CardTitle>
                <CardDescription className="text-sm leading-6">
                  첫 주제로 바로 이동해서 글을 작성하고 공개 보드를 볼 수 있습니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 px-6 py-6">
                <p className="text-sm leading-6 text-slate-600">
                  {studentHref
                    ? "학생 보드는 기존 작성 화면으로 연결됩니다."
                    : "아직 등록된 주제가 없어 학생 페이지로 연결할 수 없습니다."}
                </p>
                {studentHref ? (
                  <Link
                    href={studentHref}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-slate-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800"
                  >
                    학생 페이지 열기
                    <ArrowRight className="size-4" />
                  </Link>
                ) : (
                  <div className="inline-flex w-full items-center justify-center rounded-full bg-slate-200 px-4 py-3 text-sm font-medium text-slate-500">
                    먼저 주제를 만들어야 합니다
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] border border-white/70 bg-white/92 py-0 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
              <CardHeader className="border-b border-slate-200/70 px-6 py-6">
                <div className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl bg-teal-700 text-white">
                  <ShieldCheck className="size-6" />
                </div>
                <CardTitle className="text-2xl tracking-tight">관리자 페이지</CardTitle>
                <CardDescription className="text-sm leading-6">
                  아이디와 비밀번호로 로그인한 뒤 교사 대시보드로 이동합니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 px-6 py-6">
                <p className="text-sm leading-6 text-slate-600">
                  Supabase Authentication에 등록된 관리자 계정만 접근할 수 있습니다.
                </p>
                <Link
                  href="/admin/login"
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50"
                >
                  관리자 페이지
                  <ArrowRight className="size-4" />
                </Link>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}
