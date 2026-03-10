import Link from "next/link";
import { CalendarRange, LogOut, ShieldCheck, TriangleAlert } from "lucide-react";

import { logoutAdminAction } from "@/app/actions";
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
import {
  formatKoreanDate,
  formatKoreanDateTime,
  getBoardMeta,
  getFirstTopicId,
  getTopicById,
} from "@/lib/discussions";
import {
  getAdminSubmissions,
  getSetupState,
  getTopicSummariesFromSource,
} from "@/lib/submissions";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type AdminPageProps = {
  searchParams: Promise<{
    topic?: string;
    date?: string;
  }>;
};

function getTopicLabel(topicId: string) {
  return getTopicById(topicId)?.title ?? topicId;
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  await requireAdmin();

  const params = await searchParams;
  const board = getBoardMeta();
  const studentPageHref = `/write/${getFirstTopicId() ?? ""}`;
  const selectedTopicId =
    typeof params.topic === "string" && params.topic.length > 0 ? params.topic : "all";
  const selectedDate =
    typeof params.date === "string" && params.date.length > 0 ? params.date : "";

  const [topicSummaries, submissions] = await Promise.all([
    getTopicSummariesFromSource(),
    getAdminSubmissions({
      topicId: selectedTopicId === "all" ? undefined : selectedTopicId,
      date: selectedDate || undefined,
    }),
  ]);
  const { supabaseConfigured, submissionsReady } = await getSetupState();

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

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_28%),linear-gradient(180deg,#f5f7fb_0%,#ffffff_52%,#f8f5ed_100%)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-5 md:px-6 lg:px-8 lg:py-8">
        <header className="flex flex-col gap-4 rounded-3xl border border-white/70 bg-background/90 px-5 py-5 shadow-sm backdrop-blur md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="rounded-full">
                관리자 모드
              </Badge>
              <Badge variant="outline" className="rounded-full">
                {board.className}
              </Badge>
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                {board.title} 집계 화면
              </h1>
              <p className="text-sm text-muted-foreground">
                학생 글을 주제별, 날짜별로 필터링해서 바로 확인할 수 있습니다.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={studentPageHref}
              className="inline-flex rounded-full border border-border/70 bg-background/80 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              공개 보드로 돌아가기
            </Link>
            <form action={logoutAdminAction}>
              <Button type="submit" variant="outline" className="rounded-full">
                <LogOut className="size-4" />
                로그아웃
              </Button>
            </form>
          </div>
        </header>

        {!supabaseConfigured && (
          <Alert variant="destructive">
            <TriangleAlert className="size-4" />
            <AlertTitle>Supabase 연결 정보가 없습니다</AlertTitle>
            <AlertDescription>
              현재는 개발용 시드 데이터로 보여주고 있습니다. 실제 학생 글 저장을
              쓰려면 `.env.local`과 `supabase/schema.sql`을 먼저 적용해 주세요.
            </AlertDescription>
          </Alert>
        )}

        {supabaseConfigured && !submissionsReady && (
          <Alert variant="destructive">
            <TriangleAlert className="size-4" />
            <AlertTitle>submissions 테이블이 아직 없습니다</AlertTitle>
            <AlertDescription>
              현재는 시드 데이터로만 보이고 있습니다. Supabase SQL Editor에서
              `supabase/schema.sql`을 먼저 실행해야 실제 학생 작성이 저장됩니다.
            </AlertDescription>
          </Alert>
        )}

        <section className="grid gap-4 md:grid-cols-3">
          <Card className="rounded-[2rem] py-0">
            <CardHeader className="border-b px-5 py-5">
              <CardDescription>현재 필터 결과</CardDescription>
              <CardTitle>{submissions.length}개 응답</CardTitle>
            </CardHeader>
          </Card>
          <Card className="rounded-[2rem] py-0">
            <CardHeader className="border-b px-5 py-5">
              <CardDescription>응답이 있는 주제</CardDescription>
              <CardTitle>
                {new Set(submissions.map((submission) => submission.topicId)).size}개
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="rounded-[2rem] py-0">
            <CardHeader className="border-b px-5 py-5">
              <CardDescription>보이는 날짜 그룹</CardDescription>
              <CardTitle>{groupedSubmissions.size}일</CardTitle>
            </CardHeader>
          </Card>
        </section>

        <Card className="rounded-[2rem] border border-white/70 bg-background/88 py-0 shadow-sm backdrop-blur">
          <CardHeader className="border-b px-6 py-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" />
              <CardTitle>주제별·날짜별 필터</CardTitle>
            </div>
            <CardDescription>
              원하는 주제와 날짜만 골라서 모아볼 수 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 py-6">
            <form className="grid gap-4 md:grid-cols-[1fr_220px_auto]">
              <div className="space-y-2">
                <Label htmlFor="topic">주제</Label>
                <select
                  id="topic"
                  name="topic"
                  defaultValue={selectedTopicId}
                  className={cn(
                    "h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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
              <div className="flex items-end gap-2">
                <Button type="submit" className="rounded-full">
                  <CalendarRange className="size-4" />
                  적용
                </Button>
                <Link
                  href="/admin"
                  className="inline-flex h-9 items-center rounded-full border border-border/70 px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                >
                  초기화
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        <section className="space-y-6">
          {submissions.length === 0 ? (
            <Card className="rounded-[2rem] border border-dashed border-border/80 bg-background/70">
              <CardContent className="px-6 py-10 text-center text-sm text-muted-foreground">
                선택한 조건에 맞는 학생 글이 없습니다.
              </CardContent>
            </Card>
          ) : (
            [...groupedSubmissions.entries()].map(([dateLabel, items]) => (
              <div key={dateLabel} className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">{dateLabel}</h2>
                    <p className="text-sm text-muted-foreground">
                      이 날짜에 기록된 학생 응답 {items.length}개
                    </p>
                  </div>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  {items.map((item) => (
                    <Card key={item.id} className="rounded-[2rem] py-0">
                      <CardHeader className="gap-3 border-b px-5 py-5">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="rounded-full">
                            {getTopicLabel(item.topicId)}
                          </Badge>
                          <Badge variant="outline" className="rounded-full">
                            {item.perspective}
                          </Badge>
                        </div>
                        <div>
                          <CardTitle className="text-base">
                            {item.author}
                          </CardTitle>
                          <CardDescription>
                            {item.group} · {formatKoreanDateTime(item.submittedAt)}
                          </CardDescription>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4 px-5 py-5">
                        <p className="text-sm leading-7 text-foreground/90">
                          {item.content}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {item.keywords.map((keyword) => (
                            <Badge key={keyword} variant="outline" className="rounded-full">
                              #{keyword}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
