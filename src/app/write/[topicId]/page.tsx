import {
  BookOpenText,
  Lightbulb,
  Menu,
  NotebookPen,
  PenSquare,
} from "lucide-react";
import { notFound } from "next/navigation";

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
import { getBoardMeta, formatKoreanDateTime } from "@/lib/discussions";
import { getSetupState, getTopicSummariesFromSource } from "@/lib/submissions";
import { getTopicByIdFromSource } from "@/lib/topics";

export const dynamic = "force-dynamic";

type StudentWritePageProps = {
  params: Promise<{
    topicId: string;
  }>;
};

const writingChecklist = [
  {
    title: "입장 먼저 쓰기",
    description: "찬성, 반대보다 먼저 지금 내 생각이 어디에 가까운지 한 문장으로 적어 보세요.",
    icon: PenSquare,
  },
  {
    title: "이유와 예시 붙이기",
    description: "왜 그렇게 생각하는지, 실제 경험이나 수업 장면을 하나 이상 덧붙이면 글이 또렷해집니다.",
    icon: NotebookPen,
  },
  {
    title: "남은 질문 남기기",
    description: "아직 헷갈리는 점이나 더 이야기해 보고 싶은 질문을 마지막에 적어도 좋습니다.",
    icon: Lightbulb,
  },
];

export default async function StudentWritePage({ params }: StudentWritePageProps) {
  const { topicId } = await params;
  const board = getBoardMeta();

  const [topic, topics, setupState] = await Promise.all([
    getTopicByIdFromSource(topicId),
    getTopicSummariesFromSource(),
    getSetupState(),
  ]);

  if (!topic) {
    notFound();
  }

  const activeTopicSummary = topics.find((item) => item.id === topic.id);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(14,116,144,0.15),transparent_30%),linear-gradient(180deg,#f7f3eb_0%,#fdfcf8_48%,#eef4f8_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-5 md:px-6 lg:px-8 lg:py-8">
        <div className="grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-8 space-y-4">
              <Card className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/88 py-0 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
                <CardHeader className="border-b border-slate-200/70 px-5 py-5">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                      <BookOpenText className="size-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{board.title}</p>
                      <p className="text-xs text-slate-500">학생 작성 페이지</p>
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
                        <p className="text-xs font-medium text-slate-500">응답 수</p>
                        <p className="mt-1 text-lg font-semibold text-slate-900">
                          {activeTopicSummary?.responseCount ?? 0}
                        </p>
                      </div>
                      <div className="rounded-[1.5rem] bg-white px-4 py-3 ring-1 ring-slate-200/70">
                        <p className="text-xs font-medium text-slate-500">최근 갱신</p>
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
                      <p className="text-sm font-semibold text-slate-900">주제 목록</p>
                      <p className="text-xs text-slate-500">
                        왼쪽에서 주제를 바꾸면 작성 화면이 바로 바뀝니다.
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
            <header className="flex items-center justify-between gap-4 rounded-[2rem] border border-white/70 bg-white/88 px-5 py-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="rounded-full bg-slate-900 text-white">
                    학생 글쓰기
                  </Badge>
                  <Badge variant="outline" className="rounded-full border-slate-200 bg-white">
                    {board.facilitator}
                  </Badge>
                </div>
                <div>
                  <h1 className="text-xl font-semibold tracking-tight text-slate-950 md:text-2xl">
                    생각을 정리하고 제출하는 공간
                  </h1>
                  <p className="text-sm leading-6 text-slate-600 md:text-base">
                    다른 학생 글은 보이지 않고, 교사는 제출된 생각만 대시보드에서
                    확인합니다.
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
                      작성할 주제를 고른 뒤 오른쪽 화면에서 생각을 정리해 보세요.
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

            <Card className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/92 py-0 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
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
                    <p className="text-sm font-semibold">생각을 여는 질문</p>
                    <p className="mt-2 text-amber-900/90">{topic.guidingQuestion}</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="grid gap-4 px-6 py-6 md:grid-cols-3">
                {writingChecklist.map((item) => (
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

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="rounded-[2rem] border border-white/70 bg-white/88 py-0 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
                <CardHeader className="px-5 py-5">
                  <CardTitle className="text-base">이렇게 쓰면 더 읽기 쉽습니다</CardTitle>
                  <CardDescription className="text-sm leading-6">
                    입장, 이유, 예시를 나눠 쓰면 교사가 학생 생각의 흐름을 훨씬 쉽게
                    파악할 수 있습니다.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="rounded-[2rem] border border-white/70 bg-white/88 py-0 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
                <CardHeader className="px-5 py-5">
                  <CardTitle className="text-base">익명 제출 안내</CardTitle>
                  <CardDescription className="text-sm leading-6">
                    실명 대신 별칭을 써도 됩니다. 중요한 것은 누가 썼는지보다 어떤
                    생각을 남겼는지입니다.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <SubmissionForm
              topicId={topic.id}
              topicTitle={topic.title}
              submissionsEnabled={setupState.submissionsReady}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
