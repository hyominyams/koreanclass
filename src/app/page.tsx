import Link from "next/link";
import { ArrowRight, BookOpenText, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatKoreanDate, getBoardMeta } from "@/lib/discussions";
import { getFirstTopicIdFromSource } from "@/lib/topics";

export const dynamic = "force-dynamic";

export default async function Home() {
  const board = getBoardMeta();
  const firstTopicId = await getFirstTopicIdFromSource();
  const studentHref = firstTopicId ? `/write/${firstTopicId}` : null;
  const updatedAtLabel = formatKoreanDate(board.updatedAt);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(14,116,144,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.16),transparent_28%),linear-gradient(180deg,#f3efe7_0%,#fbfaf7_52%,#eef4f8_100%)]">
      <main className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10 md:px-6 lg:px-8">
        <div className="w-full space-y-8">
          <div className="max-w-4xl space-y-5">
            <Badge variant="secondary" className="rounded-full bg-slate-900 text-white">
              {board.title}
            </Badge>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
                생각이 모이고 대화가 이어지는 학급 참여 보드
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
                {board.subtitle}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-sm font-medium text-slate-700">
              <span className="rounded-full border border-white/70 bg-white/75 px-4 py-2 shadow-sm backdrop-blur">
                주제별 글 작성
              </span>
              <span className="rounded-full border border-white/70 bg-white/75 px-4 py-2 shadow-sm backdrop-blur">
                하트와 댓글 반응
              </span>
              <span className="rounded-full border border-white/70 bg-white/75 px-4 py-2 shadow-sm backdrop-blur">
                교사 운영 대시보드
              </span>
            </div>
            <p className="text-sm leading-6 text-slate-500">
              학생 참여 공간과 운영 대시보드를 분리해 수업 흐름에 맞는 보드 운영을 지원합니다.
              최근 업데이트 {updatedAtLabel}.
            </p>
          </div>

          <section className="grid gap-5 lg:grid-cols-2">
            <Card className="rounded-[2rem] border border-white/70 bg-white/92 py-0 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
              <CardHeader className="border-b border-slate-200/70 px-6 py-6">
                <div className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl bg-slate-900 text-white">
                  <BookOpenText className="size-6" />
                </div>
                <CardTitle className="text-2xl tracking-tight">학생 참여 공간</CardTitle>
                <CardDescription className="text-sm leading-6">
                  현재 열려 있는 주제로 바로 이동해 생각을 작성하고, 공개된 글을 함께 읽을 수
                  있습니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 px-6 py-6">
                <p className="text-sm leading-6 text-slate-600">
                  {studentHref
                    ? "운영 중인 첫 번째 주제로 연결됩니다."
                    : "공개할 주제가 등록되면 학생 참여 공간이 열립니다."}
                </p>
                {studentHref ? (
                  <Link
                    href={studentHref}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-slate-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800"
                  >
                    학생 보드 시작하기
                    <ArrowRight className="size-4" />
                  </Link>
                ) : (
                  <div className="inline-flex w-full items-center justify-center rounded-full bg-slate-200 px-4 py-3 text-sm font-medium text-slate-500">
                    운영할 주제를 먼저 등록하세요
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] border border-white/70 bg-white/92 py-0 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
              <CardHeader className="border-b border-slate-200/70 px-6 py-6">
                <div className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl bg-teal-700 text-white">
                  <ShieldCheck className="size-6" />
                </div>
                <CardTitle className="text-2xl tracking-tight">운영 대시보드</CardTitle>
                <CardDescription className="text-sm leading-6">
                  교사 계정으로 로그인해 주제를 등록하고, 참여 현황과 보드 활동을 관리합니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 px-6 py-6">
                <p className="text-sm leading-6 text-slate-600">
                  승인된 관리자 계정만 접근할 수 있습니다.
                </p>
                <Link
                  href="/admin/login"
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50"
                >
                  관리자 로그인
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
