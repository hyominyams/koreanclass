import Link from "next/link";
import {
  CalendarRange,
  LayoutDashboard,
  LogOut,
  PanelLeftOpen,
  SquareArrowOutUpRight,
  TriangleAlert,
} from "lucide-react";

import { logoutAdminAction } from "@/app/actions";
import { ResponseCard } from "@/components/response-card";
import { TopicCreatorForm } from "@/components/topic-creator-form";
import { TopicNavigation } from "@/components/topic-navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requireAdmin } from "@/lib/admin-auth";
import { formatKoreanDate, getBoardMeta } from "@/lib/discussions";
import {
  getAdminSubmissions,
  getSetupState,
  getTopicSummariesFromSource,
} from "@/lib/submissions";
import { getFirstTopicIdFromSource } from "@/lib/topics";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type AdminPageProps = {
  searchParams: Promise<{
    topic?: string;
    date?: string;
  }>;
};

function buildAdminHref(topicId?: string, date?: string) {
  const params = new URLSearchParams();

  if (topicId) {
    params.set("topic", topicId);
  }

  if (date) {
    params.set("date", date);
  }

  const query = params.toString();
  return query.length > 0 ? `/admin?${query}` : "/admin";
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  await requireAdmin();

  const params = await searchParams;
  const board = getBoardMeta();
  const selectedTopicId =
    typeof params.topic === "string" && params.topic.length > 0 ? params.topic : "all";
  const selectedDate =
    typeof params.date === "string" && params.date.length > 0 ? params.date : "";

  const [topicSummaries, submissions, setupState, firstTopicId] = await Promise.all([
    getTopicSummariesFromSource(),
    getAdminSubmissions({
      topicId: selectedTopicId === "all" ? undefined : selectedTopicId,
      date: selectedDate || undefined,
    }),
    getSetupState(),
    getFirstTopicIdFromSource(),
  ]);

  const studentPageHref = firstTopicId ? `/write/${firstTopicId}` : "/";
  const topicMap = new Map(topicSummaries.map((topic) => [topic.id, topic]));
  const activeTopicId = selectedTopicId === "all" ? "" : selectedTopicId;
  const groupedSubmissions = submissions.reduce<Map<string, typeof submissions>>(
    (groups, submission) => {
      const label = formatKoreanDate(submission.submittedAt);
      const list = groups.get(label) ?? [];
      list.push(submission);
      groups.set(label, list);
      return groups;
    },
    new Map()
  );

  const uniqueTopicCount = new Set(submissions.map((item) => item.topicId)).size;
  const totalHeartCount = submissions.reduce((sum, item) => sum + item.heartCount, 0);
  const totalCommentCount = submissions.reduce((sum, item) => sum + item.commentCount, 0);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(15,23,42,0.10),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(14,116,144,0.14),transparent_30%),linear-gradient(180deg,#f3f1eb_0%,#fbfaf7_48%,#edf3f7_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-5 md:px-6 lg:px-8 lg:py-8">
        <div className="grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-8 space-y-4">
              <Card className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 py-0 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
                <CardHeader className="border-b border-slate-200/70 px-5 py-5">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                      <LayoutDashboard className="size-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">교사 대시보드</p>
                      <p className="text-xs text-slate-500">{board.title}</p>
                    </div>
                  </div>
                  <CardDescription className="text-sm leading-6">
                    주제 관리와 전체 보드 모니터링을 한 화면에서 처리합니다.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 px-5 py-5">
                  <div className="grid gap-3">
                    <Link
                      href={studentPageHref}
                      className="inline-flex items-center justify-between rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-100"
                    >
                      학생 공유 보드 열기
                      <SquareArrowOutUpRight className="size-4" />
                    </Link>
                    <form action={logoutAdminAction}>
                      <Button type="submit" variant="outline" className="w-full rounded-[1.5rem]">
                        <LogOut className="size-4" />
                        로그아웃
                      </Button>
                    </form>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">주제 목록</p>
                        <p className="text-xs text-slate-500">
                          주제를 바꾸면 오른쪽 제출 목록이 바로 필터링됩니다.
                        </p>
                      </div>
                      <PanelLeftOpen className="size-4 text-slate-400" />
                    </div>

                    <Link
                      href={buildAdminHref(undefined, selectedDate || undefined)}
                      className={cn(
                        "flex items-center justify-between rounded-[1.25rem] border px-4 py-3 text-sm transition-colors",
                        selectedTopicId === "all"
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      )}
                    >
                      전체 주제 보기
                      <Badge
                        variant={selectedTopicId === "all" ? "secondary" : "outline"}
                        className={cn(
                          "rounded-full",
                          selectedTopicId === "all"
                            ? "border-white/10 bg-white/10 text-white"
                            : "border-slate-200 bg-white text-slate-600"
                        )}
                      >
                        {topicSummaries.length}
                      </Badge>
                    </Link>

                    <TopicNavigation
                      topics={topicSummaries}
                      activeTopicId={activeTopicId}
                      getHref={(topicId) =>
                        buildAdminHref(topicId, selectedDate || undefined)
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>

          <main className="space-y-6">
            <header className="rounded-[2rem] border border-white/70 bg-white/90 px-5 py-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="rounded-full bg-slate-900 text-white">
                      관리자 전용
                    </Badge>
                    <Badge variant="outline" className="rounded-full border-slate-200 bg-white">
                      공유 보드 운영
                    </Badge>
                  </div>
                  <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
                      학생 공유 보드 운영 화면
                    </h1>
                    <p className="text-sm leading-6 text-slate-600 md:text-base">
                      주제를 추가하고, 학생들이 올린 글과 댓글, 하트 반응까지 함께
                      모니터링합니다.
                    </p>
                  </div>
                </div>
                <div className="rounded-[1.5rem] bg-slate-50 px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-200/70">
                  마지막 기준 시각 {formatKoreanDate(board.updatedAt)}
                </div>
              </div>
            </header>

            {!setupState.supabaseConfigured ? (
              <Alert variant="destructive">
                <TriangleAlert className="size-4" />
                <AlertTitle>Supabase 환경변수가 비어 있습니다</AlertTitle>
                <AlertDescription>
                  현재는 로컬 예시 데이터만 보입니다. Vercel 또는 로컬 환경에
                  Supabase URL과 키를 먼저 설정해 주세요.
                </AlertDescription>
              </Alert>
            ) : null}

            {setupState.supabaseConfigured && !setupState.topicsReady ? (
              <Alert variant="destructive">
                <TriangleAlert className="size-4" />
                <AlertTitle>topics 테이블이 아직 준비되지 않았습니다</AlertTitle>
                <AlertDescription>
                  주제 추가와 사이드바 렌더링을 위해 `topics` 테이블이 필요합니다.
                </AlertDescription>
              </Alert>
            ) : null}

            {setupState.supabaseConfigured && !setupState.submissionsReady ? (
              <Alert variant="destructive">
                <TriangleAlert className="size-4" />
                <AlertTitle>submissions 테이블이 아직 준비되지 않았습니다</AlertTitle>
                <AlertDescription>
                  학생 글 저장과 공개 보드 표시를 위해 `submissions` 테이블이 필요합니다.
                </AlertDescription>
              </Alert>
            ) : null}

            {setupState.supabaseConfigured && !setupState.interactionsReady ? (
              <Alert variant="destructive">
                <TriangleAlert className="size-4" />
                <AlertTitle>댓글/하트 테이블이 아직 준비되지 않았습니다</AlertTitle>
                <AlertDescription>
                  `submission_comments`, `submission_hearts` 테이블이 있어야 공유 보드
                  상호작용이 동작합니다.
                </AlertDescription>
              </Alert>
            ) : null}

            <section className="grid gap-4 md:grid-cols-3">
              <Card className="rounded-[2rem] border border-white/70 bg-white/90 py-0 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
                <CardHeader className="px-5 py-5">
                  <CardDescription>현재 필터 결과</CardDescription>
                  <CardTitle className="text-2xl">{submissions.length}개 글</CardTitle>
                </CardHeader>
              </Card>
              <Card className="rounded-[2rem] border border-white/70 bg-white/90 py-0 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
                <CardHeader className="px-5 py-5">
                  <CardDescription>주제 수 / 하트</CardDescription>
                  <CardTitle className="text-2xl">
                    {uniqueTopicCount}개 / {totalHeartCount}개
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card className="rounded-[2rem] border border-white/70 bg-white/90 py-0 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
                <CardHeader className="px-5 py-5">
                  <CardDescription>전체 댓글 수</CardDescription>
                  <CardTitle className="text-2xl">{totalCommentCount}개</CardTitle>
                </CardHeader>
              </Card>
            </section>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_23rem]">
              <TopicCreatorForm />

              <Card className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 py-0 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                <CardHeader className="border-b border-slate-200/80 px-6 py-6">
                  <CardTitle className="text-xl tracking-tight">글 필터</CardTitle>
                  <CardDescription className="text-sm leading-6">
                    특정 주제나 날짜만 골라서 전체 보드 활동을 빠르게 볼 수 있습니다.
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-6 py-6">
                  <form className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="topic">주제</Label>
                      <select
                        id="topic"
                        name="topic"
                        defaultValue={selectedTopicId}
                        className={cn(
                          "flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                        )}
                      >
                        <option value="all">전체 주제</option>
                        {topicSummaries.map((topic) => (
                          <option key={topic.id} value={topic.id}>
                            {topic.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date">날짜</Label>
                      <Input id="date" name="date" type="date" defaultValue={selectedDate} />
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1 rounded-full">
                        <CalendarRange className="size-4" />
                        필터 적용
                      </Button>
                      <Link
                        href="/admin"
                        className="inline-flex h-9 items-center justify-center rounded-full border border-slate-200 px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                      >
                        초기화
                      </Link>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </section>

            <section className="space-y-6">
              {submissions.length === 0 ? (
                <Card className="rounded-[2rem] border border-dashed border-slate-300 bg-white/70 py-0">
                  <CardContent className="px-6 py-12 text-center text-sm text-slate-500">
                    선택한 조건에 맞는 학생 글이 아직 없습니다.
                  </CardContent>
                </Card>
              ) : (
                [...groupedSubmissions.entries()].map(([dateLabel, items]) => (
                  <div key={dateLabel} className="space-y-3">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-950">{dateLabel}</h2>
                      <p className="text-sm text-slate-500">
                        이 날짜에 올라온 학생 글 {items.length}개
                      </p>
                    </div>
                    <div className="grid gap-4 xl:grid-cols-2">
                      {items.map((item) => (
                        <ResponseCard
                          key={item.id}
                          response={item}
                          topicLabel={topicMap.get(item.topicId)?.title ?? item.topicId}
                        />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
