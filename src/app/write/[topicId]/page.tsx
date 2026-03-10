import {
  BookOpenText,
  Heart,
  Lightbulb,
  Menu,
  NotebookPen,
} from "lucide-react";
import { notFound } from "next/navigation";

import { BoardResponseCard } from "@/components/board-response-card";
import { SubmissionForm } from "@/components/submission-form";
import { TopicNavigation } from "@/components/topic-navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { formatKoreanDateTime, getBoardMeta } from "@/lib/discussions";
import {
  getSetupState,
  getTopicResponses,
  getTopicSummariesFromSource,
} from "@/lib/submissions";
import { getTopicByIdFromSource } from "@/lib/topics";

export const dynamic = "force-dynamic";

type StudentWritePageProps = {
  params: Promise<{
    topicId: string;
  }>;
};

const boardTips = [
  {
    title: "생각을 먼저 올리기",
    description: "완벽하게 정리되지 않아도 괜찮습니다. 지금 떠오른 생각부터 먼저 올리세요.",
    icon: NotebookPen,
  },
  {
    title: "친구 글에 반응하기",
    description: "공감되면 하트를 남기고, 더 듣고 싶으면 댓글로 질문해 보세요.",
    icon: Heart,
  },
  {
    title: "서로의 차이 보기",
    description: "같은 주제라도 관점이 다를 수 있습니다. 다른 의견을 비교하며 읽어 보세요.",
    icon: Lightbulb,
  },
];

export default async function StudentWritePage({ params }: StudentWritePageProps) {
  const { topicId } = await params;
  const board = getBoardMeta();

  const [topic, topics, responses, setupState] = await Promise.all([
    getTopicByIdFromSource(topicId),
    getTopicSummariesFromSource(),
    getTopicResponses(topicId),
    getSetupState(),
  ]);

  if (!topic) {
    notFound();
  }

  const activeTopicSummary = topics.find((item) => item.id === topic.id);
  const totalHeartCount = responses.reduce((sum, item) => sum + item.heartCount, 0);
  const totalCommentCount = responses.reduce((sum, item) => sum + item.commentCount, 0);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(14,116,144,0.14),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.16),transparent_30%),linear-gradient(180deg,#f3efe7_0%,#fbfaf7_45%,#eef4f8_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-5 md:px-6 lg:px-8 lg:py-8">
        <div className="grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-8 space-y-4">
              <Card className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/92 py-0 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
                <CardHeader className="border-b border-slate-200/70 px-5 py-5">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                      <BookOpenText className="size-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{board.title}</p>
                      <p className="text-xs text-slate-500">주제 사이드바</p>
                    </div>
                  </div>
                  <CardDescription className="text-sm leading-6">
                    {board.subtitle}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 px-5 py-5">
                  <div className="grid gap-3">
                    <div className="rounded-[1.5rem] bg-slate-50 px-4 py-3 ring-1 ring-slate-200/70">
                      <p className="text-xs font-medium text-slate-500">선택한 주제</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {topic.title}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-[1.5rem] bg-white px-4 py-3 ring-1 ring-slate-200/70">
                        <p className="text-xs font-medium text-slate-500">공유 글</p>
                        <p className="mt-1 text-lg font-semibold text-slate-900">
                          {activeTopicSummary?.responseCount ?? 0}
                        </p>
                      </div>
                      <div className="rounded-[1.5rem] bg-white px-4 py-3 ring-1 ring-slate-200/70">
                        <p className="text-xs font-medium text-slate-500">최근 글</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          {formatKoreanDateTime(
                            activeTopicSummary?.latestResponseAt ?? setupState.boardUpdatedAt
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">주제 선택</p>
                      <p className="text-xs text-slate-500">
                        왼쪽 목록에서 주제를 바꾸면 공유 보드가 바로 바뀝니다.
                      </p>
                    </div>
                    <TopicNavigation
                      topics={topics}
                      activeTopicId={topic.id}
                      hrefBase="/write"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>

          <main className="space-y-6">
            <header className="flex items-center justify-between gap-4 rounded-[2rem] border border-white/70 bg-white/92 px-5 py-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="rounded-full bg-slate-900 text-white">
                    공유 보드
                  </Badge>
                  <Badge variant="outline" className="rounded-full border-slate-200 bg-white">
                    댓글과 하트 가능
                  </Badge>
                </div>
                <div>
                  <h1 className="text-xl font-semibold tracking-tight text-slate-950 md:text-2xl">
                    우리 반이 함께 보는 카드 보드
                  </h1>
                  <p className="text-sm leading-6 text-slate-600 md:text-base">
                    글을 올리면 바로 아래 보드에 공개되고, 친구들도 하트와 댓글로
                    반응할 수 있습니다.
                  </p>
                </div>
              </div>

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
                  <SheetHeader className="border-b border-slate-200/80 px-5 py-4">
                    <SheetTitle>주제 선택</SheetTitle>
                    <SheetDescription>
                      보드에 참여할 주제를 고른 뒤 같은 화면에서 글을 남겨 보세요.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="p-5">
                    <TopicNavigation
                      topics={topics}
                      activeTopicId={topic.id}
                      hrefBase="/write"
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </header>

            {!setupState.interactionsReady ? (
              <Alert variant="destructive">
                <AlertTitle>댓글과 하트 기능이 아직 준비되지 않았습니다</AlertTitle>
                <AlertDescription>
                  현재 글 읽기와 작성은 가능하지만 댓글과 하트 저장 테이블이 아직
                  연결되지 않았습니다.
                </AlertDescription>
              </Alert>
            ) : null}

            <Card className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/94 py-0 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
              <CardHeader className="gap-5 border-b border-slate-200/80 px-6 py-6">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="rounded-full">
                        {topic.category}
                      </Badge>
                      {topic.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="rounded-full border-slate-200 bg-white"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="space-y-3">
                      <h2 className="text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">
                        {topic.title}
                      </h2>
                      <p className="max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
                        {topic.prompt}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-[1.75rem] bg-amber-50 px-5 py-5 text-sm leading-6 text-amber-950 ring-1 ring-amber-100 xl:max-w-sm">
                    <p className="text-sm font-semibold">시작 질문</p>
                    <p className="mt-2 text-amber-900/90">{topic.guidingQuestion}</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="grid gap-4 px-6 py-6 md:grid-cols-3">
                {boardTips.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-[1.75rem] bg-slate-50 px-5 py-5 ring-1 ring-slate-200/70"
                  >
                    <div className="inline-flex size-10 items-center justify-center rounded-2xl bg-white text-slate-800 ring-1 ring-slate-200">
                      <item.icon className="size-4" />
                    </div>
                    <p className="mt-4 text-sm font-semibold text-slate-900">
                      {item.title}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {item.description}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <SubmissionForm
              topicId={topic.id}
              topicTitle={topic.title}
              submissionsEnabled={setupState.submissionsReady}
            />

            <section className="space-y-4">
              <div className="flex flex-col gap-3 rounded-[2rem] border border-white/70 bg-white/92 px-5 py-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-950">모두의 카드 보드</h3>
                  <p className="text-sm text-slate-600">
                    같은 주제에 대해 친구들이 남긴 생각과 반응을 한눈에 볼 수 있습니다.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 text-sm">
                  <div className="rounded-full bg-slate-100 px-4 py-2 text-slate-700">
                    글 {responses.length}
                  </div>
                  <div className="rounded-full bg-rose-50 px-4 py-2 text-rose-700">
                    하트 {totalHeartCount}
                  </div>
                  <div className="rounded-full bg-amber-50 px-4 py-2 text-amber-700">
                    댓글 {totalCommentCount}
                  </div>
                </div>
              </div>

              {responses.length === 0 ? (
                <Card className="rounded-[2rem] border border-dashed border-slate-300 bg-white/70 py-0">
                  <CardContent className="px-6 py-12 text-center text-sm text-slate-500">
                    아직 이 주제에 올라온 글이 없습니다. 첫 글을 올려 보세요.
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 xl:grid-cols-2">
                  {responses.map((response) => (
                    <BoardResponseCard
                      key={response.id}
                      topicId={topic.id}
                      response={response}
                      interactionsEnabled={setupState.interactionsReady}
                    />
                  ))}
                </div>
              )}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
