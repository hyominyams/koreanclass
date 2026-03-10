import { MessageSquareText } from "lucide-react";
import { notFound } from "next/navigation";

import { BoardFeed } from "@/components/board-feed";
import { FloatingSubmissionButton } from "@/components/floating-submission-button";
import { TopicNavigation } from "@/components/topic-navigation";
import { formatKoreanDateTime, getBoardMeta } from "@/lib/discussions";
import {
  getSetupState,
  getTopicResponses,
  getTopicSummariesFromSource,
} from "@/lib/submissions";
import { getTopicByIdFromSource } from "@/lib/topics";

export const dynamic = "force-dynamic";

type TopicPageProps = {
  params: Promise<{
    topicId: string;
  }>;
};

const participantToneClasses = [
  "bg-[#fbe4ea] text-[#d9778a]",
  "bg-[#fce7dd] text-[#d68a67]",
  "bg-[#efe3f8] text-[#9570c4]",
  "bg-[#e6f4ef] text-[#5f9b86]",
];

function getParticipantTone(index: number) {
  return participantToneClasses[index % participantToneClasses.length];
}

export default async function TopicPage({ params }: TopicPageProps) {
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
  const participantPreview = Array.from(
    new Map(responses.map((response) => [response.author, response])).values()
  ).slice(0, 4);
  const participantCount = activeTopicSummary?.participantCount ?? participantPreview.length;
  const latestActivity = formatKoreanDateTime(
    activeTopicSummary?.latestResponseAt ?? setupState.boardUpdatedAt
  );

  return (
    <div className="min-h-screen bg-[#fdf8f5] text-[#5d4037]">
      <div className="flex min-h-screen flex-col md:flex-row">
        <aside className="w-full shrink-0 border-b border-[#f3dfd8] bg-white md:sticky md:top-0 md:h-screen md:w-80 md:border-r md:border-b-0">
          <div className="flex h-full flex-col gap-8 p-6">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-[#f598a8] text-white shadow-[0_12px_24px_rgba(245,152,168,0.28)]">
                <MessageSquareText className="size-6" />
              </div>
              <div>
                <h1 className="text-[1.75rem] font-bold tracking-tight text-[#5d4037]">
                  우리반 생각보드
                </h1>
                <p className="mt-1 text-sm leading-6 text-[#8d6e63]">{board.subtitle}</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="px-2 text-xs font-bold uppercase tracking-[0.2em] text-[#8d6e63]">
                주제 카테고리
              </p>
              <TopicNavigation topics={topics} activeTopicId={topic.id} hrefBase="/topics" />
            </div>

            <div className="mt-auto rounded-[1.75rem] border border-[#f4d8d6] bg-[#fff7f5] p-4 shadow-[0_8px_24px_rgba(190,146,146,0.08)]">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-full bg-[#f6d7d0] text-xl">
                  💭
                </div>
                <div>
                  <p className="text-base font-bold text-[#5d4037]">함께 참여해요</p>
                  <p className="text-sm text-[#8d6e63]">
                    하트와 댓글로 친구들의 생각을 응원해 보세요.
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-white px-4 py-3">
                <p className="text-xs font-semibold text-[#b08a80]">현재 주제</p>
                <p className="mt-1 text-sm font-semibold text-[#5d4037]">{topic.title}</p>
                <p className="mt-2 text-xs text-[#8d6e63]">최근 활동 {latestActivity}</p>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 md:h-screen md:overflow-y-auto">
          <div className="px-6 py-6 md:px-10 md:py-10">
            <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#f9e4e5] via-[#f8e8e9] to-[#f9eeea] px-8 py-10 shadow-[0_18px_40px_rgba(188,149,149,0.12)] md:px-12 md:py-12">
              <div className="absolute top-0 right-0 h-60 w-60 translate-x-16 -translate-y-10 rounded-full bg-white/35 blur-3xl" />

              <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                  <span className="inline-flex rounded-full bg-[#f598a8] px-4 py-1.5 text-xs font-bold text-white shadow-sm">
                    현재 진행 중인 토론
                  </span>

                  <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-[#5d4037] md:text-5xl">
                    {topic.title}
                  </h2>

                  <p className="mt-5 text-lg leading-relaxed text-[#8d6e63]">
                    {topic.prompt}
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-5 text-sm font-medium text-[#8d6e63]">
                    <span className="flex items-center gap-2">🗓️ 최근 활동 {latestActivity}</span>
                    <span className="flex items-center gap-2">
                      💬 게시물 {responses.length}개
                    </span>
                    <span className="flex items-center gap-2">
                      👥 참여 {participantCount}명
                    </span>
                  </div>
                </div>

                <div className="w-full max-w-sm space-y-4">
                  <div className="rounded-[1.5rem] border border-white/50 bg-white/45 p-4 backdrop-blur-sm">
                    <p className="text-sm font-semibold text-[#b76f7f]">생각을 여는 질문</p>
                    <p className="mt-2 text-sm leading-6 text-[#6b4d45]">
                      {topic.guidingQuestion}
                    </p>
                  </div>

                  {topic.summary ? (
                    <div className="rounded-[1.5rem] border border-white/50 bg-white/45 p-4 backdrop-blur-sm">
                      <p className="text-sm font-semibold text-[#b76f7f]">주제 한 줄 설명</p>
                      <p className="mt-2 text-sm leading-6 text-[#6b4d45]">{topic.summary}</p>
                    </div>
                  ) : null}

                  <div className="flex flex-wrap gap-2">
                    {participantPreview.map((item, index) => (
                      <div
                        key={`${item.author}-${item.id}`}
                        className={`flex size-11 items-center justify-center rounded-full border-2 border-white text-sm font-bold shadow-sm ${getParticipantTone(
                          index
                        )}`}
                        title={item.author}
                      >
                        {item.author.slice(0, 1)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <div className="mt-6 space-y-3">
              {!setupState.interactionsReady ? (
                <div className="rounded-2xl border border-[#f1d5b7] bg-[#fff3df] px-4 py-3 text-sm leading-6 text-[#8b603f]">
                  댓글과 하트 기능이 아직 준비되지 않았습니다. 게시물 읽기와 작성은 계속 가능합니다.
                </div>
              ) : null}

              {!setupState.submissionsReady ? (
                <div className="rounded-2xl border border-[#f2cfd7] bg-[#fff1f4] px-4 py-3 text-sm leading-6 text-[#9c5f6c]">
                  게시물 저장 설정이 아직 끝나지 않았습니다. 작성창은 보이지만 저장은 제한될 수 있습니다.
                </div>
              ) : null}
            </div>

            <div className="mt-10">
              <BoardFeed
                topicId={topic.id}
                responses={responses}
                interactionsEnabled={setupState.interactionsReady}
              />
            </div>
          </div>
        </main>
      </div>

      <FloatingSubmissionButton
        topicId={topic.id}
        topicTitle={topic.title}
        topicPrompt={topic.prompt}
        submissionsEnabled={setupState.submissionsReady}
      />
    </div>
  );
}
