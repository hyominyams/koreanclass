import Link from "next/link";
import {
  Menu,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users2,
} from "lucide-react";
import { notFound } from "next/navigation";

import { ResponseCard } from "@/components/response-card";
import { SubmissionForm } from "@/components/submission-form";
import { TopicNavigation } from "@/components/topic-navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  buildTopicMetrics,
  formatKoreanDateTime,
  getBoardMeta,
  getTopicById,
} from "@/lib/discussions";
import {
  getSetupState,
  getTopicResponses,
  getTopicSummariesFromSource,
} from "@/lib/submissions";

export const dynamic = "force-dynamic";

type TopicPageProps = {
  params: Promise<{
    topicId: string;
  }>;
};

export default async function TopicPage({ params }: TopicPageProps) {
  const { topicId } = await params;
  const board = getBoardMeta();
  const topic = getTopicById(topicId);

  if (!topic) {
    notFound();
  }

  const [topics, responses] = await Promise.all([
    getTopicSummariesFromSource(),
    getTopicResponses(topicId),
  ]);
  const metrics = buildTopicMetrics(responses, board.updatedAt);
  const { supabaseConfigured } = getSetupState();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.2),transparent_28%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.18),transparent_32%),linear-gradient(180deg,#f7f4ed_0%,#ffffff_48%,#f4f7fb_100%)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-5 md:px-6 lg:px-8 lg:py-8">
        <header className="flex items-center justify-between gap-4 rounded-3xl border border-white/70 bg-background/85 px-5 py-4 shadow-sm backdrop-blur md:px-6">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="rounded-full bg-background/80">
                {board.className}
              </Badge>
              <Badge variant="secondary" className="rounded-full">
                진행 {board.facilitator}
              </Badge>
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
                {board.title}
              </h1>
              <p className="text-sm text-muted-foreground md:text-base">
                {board.subtitle}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/login"
              className="hidden rounded-full border border-border/70 bg-background/80 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent md:inline-flex"
            >
              <ShieldCheck className="mr-2 size-4" />
              교사용 보기
            </Link>
            <Sheet>
              <SheetTrigger
                render={
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-full lg:hidden"
                  />
                }
              >
                <Menu className="size-4" />
                주제 목록
              </SheetTrigger>
              <SheetContent side="left" className="w-[88vw] max-w-sm p-0">
                <SheetHeader className="border-b px-5 py-4">
                  <SheetTitle>주제 목록</SheetTitle>
                  <SheetDescription>
                    보고 싶은 생각 나누기 주제를 선택하세요.
                  </SheetDescription>
                </SheetHeader>
                <div className="p-5">
                  <TopicNavigation topics={topics} activeTopicId={topic.id} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <Card className="sticky top-8 rounded-[2rem] border border-white/70 bg-background/85 py-0 shadow-sm backdrop-blur">
              <CardHeader className="gap-3 border-b px-5 py-5">
                <div className="space-y-1">
                  <CardTitle>활동 주제</CardTitle>
                  <CardDescription>
                    왼쪽 메뉴에서 주제를 고르면 오른쪽에 학생 응답과 작성 폼이
                    함께 보입니다.
                  </CardDescription>
                </div>
                <div className="rounded-2xl bg-muted/70 p-4 text-sm text-muted-foreground">
                  마지막 보드 업데이트 {formatKoreanDateTime(board.updatedAt)}
                </div>
              </CardHeader>
              <CardContent className="px-5 py-5">
                <TopicNavigation topics={topics} activeTopicId={topic.id} />
              </CardContent>
            </Card>
          </aside>

          <main className="space-y-6">
            <Card className="rounded-[2rem] border border-white/70 bg-background/88 py-0 shadow-sm backdrop-blur">
              <CardHeader className="gap-5 border-b px-6 py-6">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="rounded-full">
                        {topic.category}
                      </Badge>
                      {topic.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="rounded-full">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                        {topic.title}
                      </h2>
                      <p className="max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
                        {topic.prompt}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-3xl bg-muted/65 p-4 text-sm leading-6 text-muted-foreground xl:max-w-sm">
                    <p className="font-medium text-foreground">질문 포인트</p>
                    <p>{topic.guidingQuestion}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 px-6 py-6 md:grid-cols-3">
                <div className="rounded-3xl bg-amber-50 p-5 ring-1 ring-amber-100">
                  <div className="flex items-center gap-2 text-sm font-medium text-amber-900">
                    <Users2 className="size-4" />
                    참여 현황
                  </div>
                  <p className="mt-3 text-3xl font-semibold text-amber-950">
                    {metrics.participantCount}명
                  </p>
                  <p className="mt-1 text-sm text-amber-900/80">
                    총 {metrics.responseCount}개의 응답이 기록됐습니다.
                  </p>
                </div>
                <div className="rounded-3xl bg-sky-50 p-5 ring-1 ring-sky-100">
                  <div className="flex items-center gap-2 text-sm font-medium text-sky-900">
                    <Sparkles className="size-4" />
                    핵심 키워드
                  </div>
                  <p className="mt-3 text-3xl font-semibold text-sky-950">
                    {metrics.keywordCount}개
                  </p>
                  <p className="mt-1 text-sm text-sky-900/80">
                    작성된 글의 반복 표현을 기준으로 묶었습니다.
                  </p>
                </div>
                <div className="rounded-3xl bg-emerald-50 p-5 ring-1 ring-emerald-100">
                  <div className="flex items-center gap-2 text-sm font-medium text-emerald-900">
                    <TrendingUp className="size-4" />
                    최근 활동
                  </div>
                  <p className="mt-3 text-xl font-semibold text-emerald-950">
                    {formatKoreanDateTime(metrics.latestResponseAt)}
                  </p>
                  <p className="mt-1 text-sm text-emerald-900/80">
                    학생이 글을 쓰면 교사 화면도 바로 함께 갱신됩니다.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <Card className="rounded-[2rem] border border-white/70 bg-background/88 py-0 shadow-sm backdrop-blur">
                <CardHeader className="border-b px-6 py-5">
                  <CardTitle>주제 요약</CardTitle>
                  <CardDescription>
                    학생 응답을 바탕으로 한 핵심 흐름입니다.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 px-6 py-6">
                  <div className="rounded-3xl bg-muted/60 p-5">
                    <p className="text-base leading-8 text-foreground/90">
                      {topic.summary}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {metrics.topKeywords.length > 0 ? (
                      metrics.topKeywords.map((keyword) => (
                        <Badge
                          key={keyword}
                          variant="secondary"
                          className="rounded-full px-3 py-1"
                        >
                          #{keyword}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        아직 저장된 글이 없어서 키워드가 만들어지지 않았습니다.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[2rem] border border-white/70 bg-background/88 py-0 shadow-sm backdrop-blur">
                <CardHeader className="border-b px-6 py-5">
                  <CardTitle>관점 분포</CardTitle>
                  <CardDescription>
                    비슷한 의견 방향을 묶어 본 결과입니다.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 px-6 py-6">
                  {metrics.perspectives.length > 0 ? (
                    metrics.perspectives.map((item) => (
                      <div key={item.name} className="space-y-2">
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="font-medium text-foreground">{item.name}</span>
                          <span className="text-muted-foreground">
                            {item.count}명 · {item.percentage}%
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-muted">
                          <div
                            className="h-2 rounded-full bg-primary"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      첫 응답이 들어오면 관점 분포가 여기서 집계됩니다.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            <SubmissionForm
              topicId={topic.id}
              topicTitle={topic.title}
              submissionsEnabled={supabaseConfigured}
            />

            <section className="space-y-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <h3 className="text-xl font-semibold tracking-tight">학생 응답</h3>
                  <p className="text-sm text-muted-foreground">
                    실제 제출된 의견을 카드 형태로 확인할 수 있습니다.
                  </p>
                </div>
                <Link
                  href="/admin/login"
                  className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  교사 화면에서 주제별·날짜별로 모아보기
                </Link>
              </div>
              {responses.length > 0 ? (
                <div className="grid gap-4 lg:grid-cols-2">
                  {responses.map((response) => (
                    <ResponseCard key={response.id} response={response} />
                  ))}
                </div>
              ) : (
                <Card className="rounded-[2rem] border border-dashed border-border/80 bg-background/70">
                  <CardContent className="px-6 py-10 text-center text-sm text-muted-foreground">
                    아직 저장된 학생 글이 없습니다. 위 폼에서 첫 번째 생각을
                    남겨 보세요.
                  </CardContent>
                </Card>
              )}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
