import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUpRight,
  BookOpenText,
  FilePlus2,
  Heart,
  LayoutDashboard,
  LogOut,
  MessageCircleMore,
  SquareArrowOutUpRight,
  TriangleAlert,
  Users,
} from "lucide-react";

import { logoutAdminAction } from "@/app/actions";
import { ResponseCard } from "@/components/response-card";
import { TopicCreatorForm } from "@/components/topic-creator-form";
import { Button } from "@/components/ui/button";
import {
  formatKoreanDate,
  formatKoreanDateTime,
  getBoardMeta,
  type TopicSummary,
} from "@/lib/discussions";
import { requireAdmin } from "@/lib/admin-auth";
import {
  getAdminSubmissions,
  getSetupState,
  getTopicSummariesFromSource,
  type SubmissionRecord,
} from "@/lib/submissions";
import { getFirstTopicIdFromSource, getTopicByIdFromSource } from "@/lib/topics";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type AdminPageProps = {
  searchParams: Promise<{
    topic?: string;
    view?: string;
  }>;
};

type AdminView = "dashboard" | "topic" | "new";

type TopicInsight = TopicSummary & {
  heartCount: number;
  commentCount: number;
  activityScore: number;
  records: SubmissionRecord[];
};

function buildAdminHref(options?: { topicId?: string; view?: "new" }) {
  const params = new URLSearchParams();
  if (options?.topicId) params.set("topic", options.topicId);
  if (options?.view === "new") params.set("view", "new");
  const query = params.toString();
  return query.length > 0 ? `/admin?${query}` : "/admin";
}

function buildTopicInsights(topics: TopicSummary[], submissions: SubmissionRecord[]) {
  return topics
    .map((topic) => {
      const records = submissions.filter((item) => item.topicId === topic.id);
      const heartCount = records.reduce((sum, item) => sum + item.heartCount, 0);
      const commentCount = records.reduce((sum, item) => sum + item.commentCount, 0);
      return {
        ...topic,
        heartCount,
        commentCount,
        activityScore: topic.responseCount * 3 + heartCount * 2 + commentCount,
        records,
      };
    })
    .sort((left, right) => right.activityScore - left.activityScore);
}

function StatCard({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <section className="rounded-[28px] border border-[#dbe2ea] bg-white/82 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        </div>
        <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-[#0f1728] text-white">
          <Icon className="size-5" />
        </span>
      </div>
    </section>
  );
}

function getTopicBadge(topic: TopicInsight) {
  if (topic.responseCount === 0) return "대기";
  if (topic.activityScore >= 24 || topic.heartCount >= 10) return "활발";
  if (topic.commentCount >= 2 || topic.responseCount >= 2) return "관찰";
  return "시작";
}

function renderDashboard({
  topicInsights,
  allSubmissions,
  totalParticipants,
  totalHearts,
  totalComments,
}: {
  topicInsights: TopicInsight[];
  allSubmissions: SubmissionRecord[];
  totalParticipants: number;
  totalHearts: number;
  totalComments: number;
}) {
  const highlightedTopic = topicInsights[0] ?? null;
  const waitingTopics = topicInsights.filter((topic) => topic.responseCount === 0).length;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <StatCard
          icon={LayoutDashboard}
          label="운영 중인 주제"
          value={`${topicInsights.length}개`}
          description={`${waitingTopics}개 주제가 아직 첫 반응을 기다리고 있습니다.`}
        />
        <StatCard
          icon={Users}
          label="참여 학생"
          value={`${totalParticipants}명`}
          description={`${allSubmissions.length}개의 글이 누적되었습니다.`}
        />
        <StatCard
          icon={Heart}
          label="받은 하트"
          value={`${totalHearts}개`}
          description="학생들이 선호한 아이디어를 빠르게 찾을 수 있습니다."
        />
        <StatCard
          icon={MessageCircleMore}
          label="누적 댓글"
          value={`${totalComments}개`}
          description="토론이 이어지는 주제를 선별할 때 유용합니다."
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_0.85fr]">
        <section className="rounded-[30px] border border-[#dbe2ea] bg-white/82 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#2a6f67]">
                Performance Board
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                주제별 반응 개요
              </h2>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {topicInsights.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
                아직 등록된 주제가 없습니다. 왼쪽에서 새 주제를 추가해 주세요.
              </div>
            ) : (
              topicInsights.map((topic, index) => (
                <Link
                  key={topic.id}
                  href={buildAdminHref({ topicId: topic.id })}
                  className="flex flex-col gap-4 rounded-[24px] border border-[#e6ebf0] bg-[#fafbfc] px-4 py-4 transition-colors hover:bg-white sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-4">
                    <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#0f1728] text-sm font-semibold text-white">
                      {(index + 1).toString().padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-base font-semibold text-slate-900">
                          {topic.title}
                        </p>
                        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-600">
                          {getTopicBadge(topic)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-500">{topic.category}</p>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                        {topic.prompt}
                      </p>
                    </div>
                  </div>

                  <div className="grid shrink-0 grid-cols-3 gap-2 sm:min-w-[240px]">
                    <div className="rounded-[18px] border border-white bg-white px-3 py-3 text-center">
                      <p className="text-xs text-slate-500">글</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{topic.responseCount}</p>
                    </div>
                    <div className="rounded-[18px] border border-white bg-white px-3 py-3 text-center">
                      <p className="text-xs text-slate-500">하트</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{topic.heartCount}</p>
                    </div>
                    <div className="rounded-[18px] border border-white bg-white px-3 py-3 text-center">
                      <p className="text-xs text-slate-500">댓글</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{topic.commentCount}</p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-[30px] border border-[#dbe2ea] bg-[#0f1728] p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.16)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#9ee6d8]">
              Focus Topic
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              {highlightedTopic?.title ?? "아직 반응이 없습니다."}
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-300">
              {highlightedTopic
                ? `${highlightedTopic.category} 주제가 현재 가장 활발합니다.`
                : "새 주제를 등록하면 여기에 가장 반응이 큰 주제가 표시됩니다."}
            </p>
            {highlightedTopic ? (
              <Link
                href={buildAdminHref({ topicId: highlightedTopic.id })}
                className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[#9ee6d8]"
              >
                상세 개요 열기
                <ArrowUpRight className="size-4" />
              </Link>
            ) : null}
          </section>

          <section className="rounded-[30px] border border-[#dbe2ea] bg-white/82 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#2a6f67]">
              Recent Activity
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              최근 학생 반응
            </h2>
            {allSubmissions.length === 0 ? (
              <div className="mt-5 rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
                아직 등록된 학생 글이 없습니다.
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {allSubmissions.slice(0, 3).map((item) => (
                  <Link
                    key={item.id}
                    href={buildAdminHref({ topicId: item.topicId })}
                    className="block rounded-[22px] border border-[#e6ebf0] bg-[#fafbfc] px-4 py-4 transition-colors hover:bg-white"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-900">{item.author}</p>
                      <p className="text-xs text-slate-500">{formatKoreanDateTime(item.submittedAt)}</p>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                      {item.content}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>

      {allSubmissions.length > 0 ? (
        <section className="rounded-[30px] border border-[#dbe2ea] bg-white/82 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">전체 최근 글</h2>
          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            {allSubmissions.slice(0, 4).map((item) => (
              <ResponseCard key={item.id} response={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function renderTopicView({
  activeTopic,
  selectedTopic,
  selectedStudentPageHref,
}: {
  activeTopic: TopicInsight;
  selectedTopic: NonNullable<Awaited<ReturnType<typeof getTopicByIdFromSource>>>;
  selectedStudentPageHref: string;
}) {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[32px] border border-[#dbe2ea] bg-white/82 shadow-[0_20px_60px_rgba(15,23,42,0.1)] backdrop-blur">
        <div className="bg-[linear-gradient(135deg,#0f1728_0%,#172033_45%,#156b63_100%)] px-6 py-7 text-white sm:px-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#9ee6d8]">
            Topic Detail
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">{selectedTopic.title}</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-200 sm:text-base">
            {selectedTopic.prompt}
          </p>
        </div>

        <div className="grid gap-4 px-6 py-6 md:grid-cols-2 2xl:grid-cols-4">
          <StatCard
            icon={BookOpenText}
            label="참여 글"
            value={`${activeTopic.responseCount}개`}
            description="현재 이 주제에 올라온 학생 글 수입니다."
          />
          <StatCard
            icon={Users}
            label="참여 학생"
            value={`${activeTopic.participantCount}명`}
            description="중복 없이 계산한 참여 인원입니다."
          />
          <StatCard
            icon={Heart}
            label="받은 하트"
            value={`${activeTopic.heartCount}개`}
            description="관심이 모인 아이디어를 빠르게 찾을 수 있습니다."
          />
          <StatCard
            icon={MessageCircleMore}
            label="댓글 수"
            value={`${activeTopic.commentCount}개`}
            description="주제 안에서 토론이 이어지는 정도를 보여 줍니다."
          />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_0.85fr]">
        <section className="rounded-[30px] border border-[#dbe2ea] bg-white/82 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#2a6f67]">
                Student Feed
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                이 주제에 올라온 글
              </h2>
            </div>
            <Link
              href={selectedStudentPageHref}
              className="inline-flex items-center gap-2 text-sm font-medium text-[#156b63]"
            >
              학생 화면으로 보기
              <SquareArrowOutUpRight className="size-4" />
            </Link>
          </div>

          {activeTopic.records.length === 0 ? (
            <div className="mt-6 rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-5 py-12 text-center text-sm text-slate-500">
              아직 이 주제에 올라온 글이 없습니다.
            </div>
          ) : (
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              {activeTopic.records.map((item) => (
                <ResponseCard key={item.id} response={item} />
              ))}
            </div>
          )}
        </section>

        <div className="space-y-6">
          <section className="rounded-[30px] border border-[#dbe2ea] bg-white/82 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#2a6f67]">
              Teacher Note
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              수업 운영 메모
            </h2>
            <div className="mt-5 space-y-4">
              <div className="rounded-[24px] border border-[#e6ebf0] bg-[#fafbfc] px-5 py-5">
                <p className="text-sm font-semibold text-slate-900">생각을 여는 질문</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {selectedTopic.guidingQuestion}
                </p>
              </div>
              <div className="rounded-[24px] border border-[#e6ebf0] bg-[#fafbfc] px-5 py-5">
                <p className="text-sm font-semibold text-slate-900">주제 한 줄 요약</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">{selectedTopic.summary}</p>
              </div>
              <div className="rounded-[24px] border border-[#e6ebf0] bg-[#fafbfc] px-5 py-5">
                <p className="text-sm font-semibold text-slate-900">태그</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedTopic.tags.length > 0 ? (
                    selectedTopic.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-[#d7e6e2] bg-[#edf7f4] px-3 py-1 text-xs font-medium text-[#156b63]"
                      >
                        #{tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">등록된 태그가 없습니다.</span>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[30px] border border-[#dbe2ea] bg-[#0f1728] p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.16)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#9ee6d8]">
              Quick Action
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">다음 운영 단계</h2>
            <div className="mt-5 space-y-3">
              <Link
                href={selectedStudentPageHref}
                className="flex items-center justify-between rounded-[22px] border border-white/10 bg-white/6 px-4 py-4 text-sm font-medium transition-colors hover:bg-white/10"
              >
                학생 화면에서 이 주제 확인
                <SquareArrowOutUpRight className="size-4" />
              </Link>
              <Link
                href={buildAdminHref({ view: "new" })}
                className="flex items-center justify-between rounded-[22px] border border-white/10 bg-white/6 px-4 py-4 text-sm font-medium transition-colors hover:bg-white/10"
              >
                이어서 새 주제 추가하기
                <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

function renderNewTopicView({ topicCount }: { topicCount: number }) {
  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-[#dbe2ea] bg-white/82 px-6 py-7 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur sm:px-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#2a6f67]">
              Topic Studio
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              새 주제 추가하기
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              학생용 보드와 다른 교사용 흐름으로 정리했습니다. 제목, 설명, 질문만 정리하면
              바로 주제를 열 수 있습니다.
            </p>
          </div>
          <div className="rounded-[24px] border border-[#dbe2ea] bg-[#fafbfc] px-4 py-4">
            <p className="text-xs text-slate-500">현재 등록된 주제</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{topicCount}개</p>
          </div>
        </div>
      </section>
      <TopicCreatorForm />
    </div>
  );
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  await requireAdmin();

  const params = await searchParams;
  const board = getBoardMeta();
  const requestedTopicId =
    typeof params.topic === "string" && params.topic.length > 0 ? params.topic : "";
  const requestedView = params.view === "new" ? "new" : "dashboard";

  const [topicSummaries, allSubmissions, setupState, firstTopicId, selectedTopic] =
    await Promise.all([
      getTopicSummariesFromSource(),
      getAdminSubmissions(),
      getSetupState(),
      getFirstTopicIdFromSource(),
      requestedTopicId ? getTopicByIdFromSource(requestedTopicId) : Promise.resolve(null),
    ]);

  const topicInsights = buildTopicInsights(topicSummaries, allSubmissions);
  const activeTopic = selectedTopic
    ? topicInsights.find((topic) => topic.id === selectedTopic.id) ?? null
    : null;
  const activeView: AdminView = activeTopic ? "topic" : requestedView;
  const studentPageHref = firstTopicId ? `/topics/${firstTopicId}` : "/";
  const selectedStudentPageHref = activeTopic ? `/topics/${activeTopic.id}` : studentPageHref;
  const totalParticipants = new Set(
    allSubmissions.map((item) => `${item.gradeClass}:${item.author}`)
  ).size;
  const totalHearts = allSubmissions.reduce((sum, item) => sum + item.heartCount, 0);
  const totalComments = allSubmissions.reduce((sum, item) => sum + item.commentCount, 0);
  const latestSubmission = allSubmissions[0] ?? null;
  const notices = [
    !setupState.supabaseConfigured
      ? "Supabase 연결이 없어 현재는 예시 데이터로 표시됩니다."
      : null,
    setupState.supabaseConfigured && !setupState.topicsReady
      ? "`topics` 테이블이 준비되지 않았습니다."
      : null,
    setupState.supabaseConfigured && !setupState.submissionsReady
      ? "`submissions` 테이블이 준비되지 않았습니다."
      : null,
    setupState.supabaseConfigured && !setupState.interactionsReady
      ? "댓글 또는 하트 테이블이 준비되지 않았습니다."
      : null,
  ].filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(15,23,42,0.1),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(13,148,136,0.14),transparent_26%),linear-gradient(180deg,#f4f1ea_0%,#edf2f4_45%,#f8f8f7_100%)]">
      <div className="mx-auto max-w-[1600px] px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="xl:sticky xl:top-6 xl:self-start">
            <div className="overflow-hidden rounded-[32px] border border-white/10 bg-[#0f1728] text-white shadow-[0_28px_80px_rgba(15,23,42,0.32)]">
              <div className="border-b border-white/10 px-6 py-7">
                <div className="flex items-center gap-3">
                  <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-white/10 text-[#9ee6d8]">
                    <LayoutDashboard className="size-5" />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9ee6d8]">
                      Teacher Space
                    </p>
                    <h1 className="mt-2 text-2xl font-semibold tracking-tight">교사 운영실</h1>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-300">{board.subtitle}</p>
              </div>

              <div className="space-y-2 px-4 py-5">
                <Link
                  href="/admin"
                  className={cn(
                    "flex items-center justify-between rounded-[24px] border px-4 py-4 transition-colors",
                    activeView === "dashboard"
                      ? "border-[#9ee6d8]/40 bg-white/10"
                      : "border-white/8 bg-white/[0.03] hover:bg-white/[0.06]"
                  )}
                >
                  <div>
                    <p className="text-sm font-semibold">종합 대시보드</p>
                    <p className="mt-1 text-xs text-slate-400">전체 참여와 주제 흐름 요약</p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/8 px-2.5 py-1 text-xs text-slate-200">
                    {topicSummaries.length}
                  </span>
                </Link>

                <Link
                  href={buildAdminHref({ view: "new" })}
                  className={cn(
                    "flex items-center justify-between rounded-[24px] border px-4 py-4 transition-colors",
                    activeView === "new"
                      ? "border-[#f7c45f]/40 bg-[#f7c45f]/12"
                      : "border-white/8 bg-white/[0.03] hover:bg-white/[0.06]"
                  )}
                >
                  <div>
                    <p className="text-sm font-semibold">새 주제 추가하기</p>
                    <p className="mt-1 text-xs text-slate-400">학생 보드에 바로 반영됩니다.</p>
                  </div>
                  <FilePlus2 className="size-4 text-[#f7c45f]" />
                </Link>

                <div className="pt-4">
                  <div className="flex items-center justify-between px-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                      Topic Overview
                    </p>
                    <p className="text-xs text-slate-500">{topicInsights.length}개</p>
                  </div>
                  <div className="mt-3 space-y-2">
                    {topicInsights.map((topic) => (
                      <Link
                        key={topic.id}
                        href={buildAdminHref({ topicId: topic.id })}
                        className={cn(
                          "block rounded-[24px] border px-4 py-4 transition-colors",
                          activeView === "topic" && activeTopic?.id === topic.id
                            ? "border-[#9ee6d8]/40 bg-[#9ee6d8]/10"
                            : "border-white/8 bg-white/[0.03] hover:bg-white/[0.06]"
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{topic.title}</p>
                            <p className="mt-1 text-xs text-slate-400">{topic.category}</p>
                          </div>
                          <span className="rounded-full border border-white/10 bg-white/8 px-2.5 py-1 text-[11px] text-slate-200">
                            {getTopicBadge(topic)}
                          </span>
                        </div>
                        <div className="mt-4 flex items-center gap-4 text-xs text-slate-300">
                          <span>{topic.responseCount}글</span>
                          <span>{topic.heartCount}하트</span>
                          <span>{topic.commentCount}댓글</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 px-4 py-4">
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                  <Link
                    href={selectedStudentPageHref}
                    className="inline-flex items-center justify-between rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-slate-100 transition-colors hover:bg-white/[0.08]"
                  >
                    학생 보드 보기
                    <SquareArrowOutUpRight className="size-4" />
                  </Link>
                  <form action={logoutAdminAction}>
                    <Button
                      type="submit"
                      variant="outline"
                      className="h-12 w-full rounded-[20px] border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08] hover:text-white"
                    >
                      <LogOut className="size-4" />
                      로그아웃
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </aside>

          <main className="space-y-6">
            <header className="relative overflow-hidden rounded-[32px] border border-[#dbe2ea] bg-white/72 px-6 py-7 shadow-[0_20px_60px_rgba(15,23,42,0.1)] backdrop-blur sm:px-7">
              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-[#bfe4dd] bg-[#e8f6f2] px-3 py-1 text-xs font-semibold text-[#156b63]">
                      교사용 운영 보드
                    </span>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                      {activeView === "dashboard"
                        ? "종합 대시보드"
                        : activeView === "topic"
                          ? "선택 주제 개요"
                          : "새 주제 작성"}
                    </span>
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#2a6f67]">
                      Teacher Console
                    </p>
                    <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#0f1728] sm:text-[2.15rem]">
                      교사 페이지 대시보드
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                      왼쪽 사이드바에서 전체 현황, 주제별 개요, 새 주제 추가를 빠르게 전환할 수
                      있도록 정리했습니다.
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:w-[360px]">
                  <div className="rounded-[24px] border border-white/70 bg-white/80 px-4 py-4">
                    <p className="text-xs font-medium text-slate-500">마지막 업데이트</p>
                    <p className="mt-2 text-base font-semibold text-slate-900">
                      {formatKoreanDate(board.updatedAt)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {latestSubmission
                        ? `최근 반응 ${formatKoreanDateTime(latestSubmission.submittedAt)}`
                        : "아직 학생 반응이 없습니다."}
                    </p>
                  </div>
                  <div className="rounded-[24px] border border-white/70 bg-[#0f1728] px-4 py-4 text-white">
                    <p className="text-xs font-medium text-slate-300">학생 보드 바로가기</p>
                    <Link
                      href={selectedStudentPageHref}
                      className="mt-2 inline-flex items-center gap-2 text-base font-semibold"
                    >
                      현재 보드 열기
                      <SquareArrowOutUpRight className="size-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </header>

            {notices.length > 0 ? (
              <section className="rounded-[28px] border border-[#f2d5b6] bg-[#fff7ee] p-5 shadow-[0_16px_40px_rgba(148,96,32,0.08)]">
                <div className="flex items-start gap-3">
                  <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-[#fee8cc] text-[#9a5a17]">
                    <TriangleAlert className="size-5" />
                  </span>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-[#7a4613]">설정 확인이 필요한 항목</p>
                    {notices.map((notice) => (
                      <p key={notice} className="text-sm leading-6 text-[#9a6a32]">
                        {notice}
                      </p>
                    ))}
                  </div>
                </div>
              </section>
            ) : null}

            {activeView === "dashboard"
              ? renderDashboard({
                  topicInsights,
                  allSubmissions,
                  totalParticipants,
                  totalHearts,
                  totalComments,
                })
              : null}

            {activeView === "topic" && activeTopic && selectedTopic
              ? renderTopicView({
                  activeTopic,
                  selectedTopic,
                  selectedStudentPageHref,
                })
              : null}

            {activeView === "new" ? renderNewTopicView({ topicCount: topicSummaries.length }) : null}
          </main>
        </div>
      </div>
    </div>
  );
}
