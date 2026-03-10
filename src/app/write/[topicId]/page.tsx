import { Menu, PencilLine } from "lucide-react";
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
import { formatKoreanDateTime, getBoardMeta, getTopicById } from "@/lib/discussions";
import { getSetupState, getTopicSummariesFromSource } from "@/lib/submissions";

export const dynamic = "force-dynamic";

type StudentWritePageProps = {
  params: Promise<{
    topicId: string;
  }>;
};

const writingChecklist = [
  {
    title: "입장 정하기",
    description: "내가 어떤 관점에서 말하는지 한 문장으로 먼저 적어 보세요.",
  },
  {
    title: "이유 붙이기",
    description: "왜 그렇게 생각하는지 경험, 예시, 근거를 하나 이상 덧붙이세요.",
  },
  {
    title: "질문 남기기",
    description: "아직 고민되는 점이나 더 이야기하고 싶은 질문도 함께 적어도 됩니다.",
  },
];

export default async function StudentWritePage({ params }: StudentWritePageProps) {
  const { topicId } = await params;
  const board = getBoardMeta();
  const topic = getTopicById(topicId);

  if (!topic) {
    notFound();
  }

  const [topics, setupState] = await Promise.all([
    getTopicSummariesFromSource(),
    getSetupState(),
  ]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.22),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.18),transparent_32%),linear-gradient(180deg,#f6efe3_0%,#fffdf8_45%,#eef6fb_100%)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-5 md:px-6 lg:px-8 lg:py-8">
        <header className="flex items-center justify-between gap-4 rounded-3xl border border-white/70 bg-background/90 px-5 py-5 shadow-sm backdrop-blur md:px-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="rounded-full bg-background/80">
                {board.className}
              </Badge>
              <Badge variant="secondary" className="rounded-full">
                학생 작성 페이지
              </Badge>
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
                {board.title}
              </h1>
              <p className="text-sm text-muted-foreground md:text-base">
                익명으로 생각을 정리하고 제출하는 공간입니다.
              </p>
            </div>
          </div>
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="outline" size="lg" className="rounded-full lg:hidden" />
              }
            >
              <Menu className="size-4" />
              주제 목록
            </SheetTrigger>
            <SheetContent side="left" className="w-[88vw] max-w-sm p-0">
              <SheetHeader className="border-b px-5 py-4">
                <SheetTitle>주제 선택</SheetTitle>
                <SheetDescription>
                  오늘 이야기하고 싶은 주제를 골라 생각을 정리해 보세요.
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

        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <Card className="sticky top-8 rounded-[2rem] border border-white/70 bg-background/90 py-0 shadow-sm backdrop-blur">
              <CardHeader className="gap-3 border-b px-5 py-5">
                <div className="space-y-1">
                  <CardTitle>주제 탐색</CardTitle>
                  <CardDescription>
                    왼쪽에서 주제를 바꾸면 오른쪽 작성 카드가 바로 업데이트됩니다.
                  </CardDescription>
                </div>
                <div className="rounded-2xl bg-muted/70 p-4 text-sm text-muted-foreground">
                  마지막 안내 업데이트 {formatKoreanDateTime(setupState.boardUpdatedAt)}
                </div>
              </CardHeader>
              <CardContent className="px-5 py-5">
                <TopicNavigation
                  topics={topics}
                  activeTopicId={topic.id}
                  hrefBase="/write"
                />
              </CardContent>
            </Card>
          </aside>

          <main className="space-y-6">
            <Card className="rounded-[2rem] border border-white/70 bg-background/90 py-0 shadow-sm backdrop-blur">
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
                  <div className="rounded-3xl bg-amber-50 p-5 text-sm leading-6 text-amber-950 ring-1 ring-amber-100 xl:max-w-sm">
                    <p className="font-semibold">생각을 시작하는 질문</p>
                    <p className="mt-2 text-amber-900/90">{topic.guidingQuestion}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 px-6 py-6 md:grid-cols-3">
                {writingChecklist.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-3xl bg-white/80 p-5 ring-1 ring-slate-200"
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <PencilLine className="size-4" />
                      {item.title}
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {item.description}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] border border-white/70 bg-background/90 py-0 shadow-sm backdrop-blur">
              <CardHeader className="border-b px-6 py-5">
                <CardTitle>작성 전에 한 번 더</CardTitle>
                <CardDescription>
                  정답을 맞히는 페이지가 아니라 내 생각을 정리하는 페이지입니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 px-6 py-6 md:grid-cols-2">
                <div className="rounded-3xl bg-sky-50 p-5 ring-1 ring-sky-100">
                  <p className="text-sm font-semibold text-sky-950">이렇게 쓰면 좋습니다</p>
                  <p className="mt-2 text-sm leading-6 text-sky-900/85">
                    입장, 이유, 예시를 연결하면 교사가 읽을 때 생각의 흐름이 더 잘 보입니다.
                  </p>
                </div>
                <div className="rounded-3xl bg-emerald-50 p-5 ring-1 ring-emerald-100">
                  <p className="text-sm font-semibold text-emerald-950">익명 제출 안내</p>
                  <p className="mt-2 text-sm leading-6 text-emerald-900/85">
                    실명 대신 별칭을 적어도 됩니다. 이름보다 생각 내용이 더 중요합니다.
                  </p>
                </div>
              </CardContent>
            </Card>

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
