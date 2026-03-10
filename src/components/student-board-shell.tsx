"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Menu, MessageSquareText, X } from "lucide-react";

import { BoardFeed } from "@/components/board-feed";
import { FloatingSubmissionButton } from "@/components/floating-submission-button";
import { TopicNavigation } from "@/components/topic-navigation";
import type {
  BoardMeta,
  ResponseItem,
  TopicDefinition,
  TopicSummary,
} from "@/lib/discussions";
import {
  STUDENT_PROFILE_STORAGE_KEY,
  type StudentProfile,
} from "@/lib/student-profile";

type StudentBoardShellProps = {
  board: BoardMeta;
  topic: TopicDefinition;
  topics: TopicSummary[];
  responses: ResponseItem[];
  interactionsEnabled: boolean;
  submissionsEnabled: boolean;
  latestActivity: string;
  participantCount: number;
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

function getProfileInitial(profile: StudentProfile | null) {
  if (!profile?.authorName) {
    return "🙂";
  }

  return profile.authorName.slice(0, 1);
}

function getStoredProfile(): StudentProfile | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(STUDENT_PROFILE_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<StudentProfile>;
    const authorName = parsed.authorName?.trim();
    const gradeClass = parsed.gradeClass?.trim();

    if (!authorName || !gradeClass) {
      return null;
    }

    return {
      authorName,
      gradeClass,
    };
  } catch {
    return null;
  }
}

function saveProfile(profile: StudentProfile) {
  window.localStorage.setItem(STUDENT_PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

function subscribeToClientRender(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("storage", callback);
  };
}

function StudentProfileCard({
  profile,
  onEdit,
  compact = false,
}: {
  profile: StudentProfile | null;
  onEdit: () => void;
  compact?: boolean;
}) {
  return (
    <div
      className={
        compact
          ? "flex items-center gap-3 rounded-2xl border border-[#f0dedd] bg-white px-3 py-3"
          : "rounded-[1.75rem] border border-[#f4d8d6] bg-[#fff7f5] p-4 shadow-[0_8px_24px_rgba(190,146,146,0.08)]"
      }
    >
      <div className="flex size-12 items-center justify-center rounded-full border-2 border-[#f2c7bf] bg-[#fff0ec] text-base font-bold text-[#9c6b5b]">
        {getProfileInitial(profile)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-[#5d4037]">
          {profile ? `${profile.authorName} 학생` : "학생 정보가 필요해요"}
        </p>
        <p className="truncate text-xs text-[#8d6e63]">
          {profile ? profile.gradeClass : "학년 반과 이름을 먼저 입력해 주세요."}
        </p>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="inline-flex h-9 items-center justify-center rounded-full bg-white px-3 text-xs font-semibold text-[#d87d8e] shadow-sm ring-1 ring-[#f0d9dc] transition hover:bg-[#fff4f6]"
      >
        수정
      </button>
    </div>
  );
}

function StudentProfileSheet({
  open,
  onClose,
  onSave,
  initialProfile,
  forceOpen,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (profile: StudentProfile) => void;
  initialProfile: StudentProfile | null;
  forceOpen: boolean;
}) {
  const [authorName, setAuthorName] = useState(initialProfile?.authorName ?? "");
  const [gradeClass, setGradeClass] = useState(initialProfile?.gradeClass ?? "6학년 1반");
  const [errorMessage, setErrorMessage] = useState("");

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-[#6d5148]/35 px-0 backdrop-blur-sm sm:items-center sm:px-4">
      <div className="max-h-[92vh] w-full overflow-hidden rounded-t-[2rem] border border-[#f0dedd] bg-white shadow-[0_30px_80px_rgba(146,101,101,0.22)] sm:max-w-lg sm:rounded-[2rem]">
        <div className="flex items-start justify-between gap-4 border-b border-[#f1e2de] bg-[#fff7f5] px-5 py-5 sm:px-6">
          <div>
            <h3 className="text-lg font-bold text-[#5d4037] sm:text-xl">학생 정보 설정</h3>
            <p className="mt-2 text-sm leading-6 text-[#8d6e63]">
              처음 한 번만 입력하면 게시물과 댓글에 자동으로 사용됩니다.
            </p>
          </div>
          {!forceOpen ? (
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 text-[#b08a80] transition-colors hover:text-[#8d6e63]"
              aria-label="닫기"
            >
              <X className="size-6" />
            </button>
          ) : null}
        </div>

        <form
          className="space-y-5 px-5 py-5 sm:px-6"
          onSubmit={(event) => {
            event.preventDefault();

            const nextProfile = {
              authorName: authorName.trim(),
              gradeClass: gradeClass.trim(),
            };

            if (!nextProfile.gradeClass || !nextProfile.authorName) {
              setErrorMessage("학년 반과 이름을 모두 입력해 주세요.");
              return;
            }

            onSave(nextProfile);
          }}
        >
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-[#b08a80]">
              학년 반
            </span>
            <input
              value={gradeClass}
              onChange={(event) => setGradeClass(event.target.value)}
              className="w-full rounded-2xl border border-[#ecd8d2] bg-[#fff7f5] px-4 py-3 text-base text-[#5d4037] outline-none transition focus:border-[#f29cab] focus:bg-white focus:ring-4 focus:ring-[#fde6eb]"
              placeholder="예: 6학년 1반"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-[#b08a80]">
              이름
            </span>
            <input
              value={authorName}
              onChange={(event) => setAuthorName(event.target.value)}
              className="w-full rounded-2xl border border-[#ecd8d2] bg-[#fff7f5] px-4 py-3 text-base text-[#5d4037] outline-none transition focus:border-[#f29cab] focus:bg-white focus:ring-4 focus:ring-[#fde6eb]"
              placeholder="예: 김지우"
            />
          </label>

          {errorMessage ? (
            <p className="rounded-2xl border border-[#f2cfd7] bg-[#fff1f4] px-4 py-3 text-sm text-[#9c5f6c]">
              {errorMessage}
            </p>
          ) : null}

          <button
            type="submit"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#f598a8] px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(245,152,168,0.28)] transition hover:bg-[#ef8799]"
          >
            이 정보로 입장하기
          </button>
        </form>
      </div>
    </div>
  );
}

export function StudentBoardShell({
  board,
  topic,
  topics,
  responses,
  interactionsEnabled,
  submissionsEnabled,
  latestActivity,
  participantCount,
}: StudentBoardShellProps) {
  const isHydrated = useSyncExternalStore(
    subscribeToClientRender,
    () => true,
    () => false
  );
  const [profile, setProfile] = useState<StudentProfile | null>(() =>
    typeof window === "undefined" ? null : getStoredProfile()
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileSheetOpen, setProfileSheetOpen] = useState(() =>
    typeof window === "undefined" ? false : !getStoredProfile()
  );

  useEffect(() => {
    if (!sidebarOpen && !profileSheetOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [profileSheetOpen, sidebarOpen]);

  const participantPreview = Array.from(
    new Map(responses.map((response) => [response.author, response])).values()
  ).slice(0, 4);
  const remainingParticipants = Math.max(participantCount - participantPreview.length, 0);

  const handleSaveProfile = (nextProfile: StudentProfile) => {
    saveProfile(nextProfile);
    setProfile(nextProfile);
    setProfileSheetOpen(false);
  };

  return (
    <>
      <div className="min-h-screen bg-[#fdf8f5] text-[#5d4037]">
        <div className="min-h-screen xl:flex">
          <aside className="hidden xl:sticky xl:top-0 xl:block xl:h-screen xl:w-80 xl:shrink-0 xl:border-r xl:border-[#f3dfd8] xl:bg-white">
            <div className="flex h-full flex-col gap-8 p-6">
              <div className="flex items-center gap-4">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-[#f598a8] text-white shadow-[0_12px_24px_rgba(245,152,168,0.28)]">
                  <MessageSquareText className="size-7" />
                </div>
                <div>
                  <h1 className="text-[1.6rem] font-bold tracking-tight text-[#5d4037]">
                    우리반 생각보드
                  </h1>
                  <p className="mt-1 text-sm leading-6 text-[#8d6e63]">{board.subtitle}</p>
                </div>
              </div>

              <div className="min-h-0 space-y-4">
                <p className="px-2 text-xs font-bold uppercase tracking-[0.2em] text-[#8d6e63]">
                  주제 카테고리
                </p>
                <TopicNavigation topics={topics} activeTopicId={topic.id} hrefBase="/topics" />
              </div>

              <div className="mt-auto">
                <StudentProfileCard
                  profile={profile}
                  onEdit={() => setProfileSheetOpen(true)}
                />
              </div>
            </div>
          </aside>

          <main className="min-w-0 flex-1">
            <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-8 xl:max-w-none">
              <section className="rounded-[1.75rem] border border-[#f1dfda] bg-white px-4 py-4 shadow-[0_10px_24px_rgba(190,146,146,0.06)] sm:px-5 xl:hidden">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#f598a8] text-white shadow-[0_10px_20px_rgba(245,152,168,0.24)]">
                      <MessageSquareText className="size-6" />
                    </div>
                    <div className="min-w-0">
                      <h1 className="text-xl font-bold tracking-tight text-[#5d4037]">
                        우리반 생각보드
                      </h1>
                      <p className="mt-1 text-sm leading-6 text-[#8d6e63]">
                        {board.subtitle}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSidebarOpen(true)}
                    className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl border border-[#f0dedd] bg-[#fff7f5] text-[#8d6e63] shadow-sm transition hover:bg-white"
                    aria-label="사이드바 열기"
                  >
                    <Menu className="size-5" />
                  </button>
                </div>

                {isHydrated ? (
                  <div className="mt-4">
                    <StudentProfileCard
                      profile={profile}
                      compact
                      onEdit={() => setProfileSheetOpen(true)}
                    />
                  </div>
                ) : null}
              </section>

              <section className="relative mt-4 overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#f9e4e5] via-[#f8e8e9] to-[#f9eeea] px-5 py-6 shadow-[0_18px_40px_rgba(188,149,149,0.12)] sm:mt-6 sm:px-7 sm:py-8 lg:px-10 lg:py-10">
                <div className="absolute top-0 right-0 h-40 w-40 translate-x-10 -translate-y-8 rounded-full bg-white/35 blur-3xl sm:h-56 sm:w-56 sm:translate-x-16 sm:-translate-y-10" />

                <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-3xl">
                    <span className="inline-flex rounded-full bg-[#f598a8] px-4 py-1.5 text-xs font-bold text-white shadow-sm">
                      현재 진행 중인 토론
                    </span>

                    <h2 className="mt-4 text-[2rem] font-bold leading-tight tracking-tight text-[#5d4037] sm:text-[2.5rem] lg:text-5xl">
                      {topic.title}
                    </h2>

                    <p className="mt-4 text-base leading-7 text-[#8d6e63] sm:text-lg sm:leading-8">
                      {topic.prompt}
                    </p>

                    <div className="mt-5 flex flex-wrap items-center gap-3 text-sm font-medium text-[#8d6e63] sm:gap-5">
                      <span className="flex items-center gap-2">🗓️ 최근 활동 {latestActivity}</span>
                      <span className="flex items-center gap-2">💬 게시물 {responses.length}개</span>
                      <span className="flex items-center gap-2">👥 참여 {participantCount}명</span>
                    </div>
                  </div>

                  <div className="grid w-full gap-3 sm:grid-cols-2 lg:max-w-md lg:grid-cols-1">
                    <div className="rounded-[1.5rem] border border-white/50 bg-white/55 p-4 backdrop-blur-sm">
                      <p className="text-sm font-semibold text-[#b76f7f]">생각을 여는 질문</p>
                      <p className="mt-2 text-sm leading-6 text-[#6b4d45]">
                        {topic.guidingQuestion}
                      </p>
                    </div>

                    {topic.summary ? (
                      <div className="rounded-[1.5rem] border border-white/50 bg-white/55 p-4 backdrop-blur-sm">
                        <p className="text-sm font-semibold text-[#b76f7f]">주제 한 줄 설명</p>
                        <p className="mt-2 text-sm leading-6 text-[#6b4d45]">
                          {topic.summary}
                        </p>
                      </div>
                    ) : null}

                    <div className="rounded-[1.5rem] border border-white/50 bg-white/55 p-4 backdrop-blur-sm sm:col-span-2 lg:col-span-1">
                      <p className="text-sm font-semibold text-[#b76f7f]">함께 참여한 친구들</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
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
                        {remainingParticipants > 0 ? (
                          <div className="flex size-11 items-center justify-center rounded-full border-2 border-white bg-[#f598a8] text-sm font-bold text-white shadow-sm">
                            +{remainingParticipants}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <div className="mt-4 space-y-3 sm:mt-5">
                {!interactionsEnabled ? (
                  <div className="rounded-2xl border border-[#f1d5b7] bg-[#fff3df] px-4 py-3 text-sm leading-6 text-[#8b603f]">
                    댓글과 하트 기능이 아직 준비되지 않았습니다. 게시물 읽기와 작성은 계속 가능합니다.
                  </div>
                ) : null}

                {!submissionsEnabled ? (
                  <div className="rounded-2xl border border-[#f2cfd7] bg-[#fff1f4] px-4 py-3 text-sm leading-6 text-[#9c5f6c]">
                    게시물 저장 설정이 아직 끝나지 않았습니다. 작성창은 보이지만 저장은 제한될 수 있습니다.
                  </div>
                ) : null}
              </div>

              <div className="mt-8 pb-24 sm:mt-10 sm:pb-28">
                <BoardFeed
                  topicId={topic.id}
                  responses={responses}
                  interactionsEnabled={interactionsEnabled}
                  profile={profile}
                />
              </div>
            </div>
          </main>
        </div>

        <FloatingSubmissionButton
          topicId={topic.id}
          topicTitle={topic.title}
          topicPrompt={topic.prompt}
          submissionsEnabled={submissionsEnabled}
          profile={profile}
        />
      </div>

      {sidebarOpen ? (
        <div className="fixed inset-0 z-[60] xl:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-[#6d5148]/35 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
            aria-label="사이드바 닫기"
          />
          <aside className="absolute top-0 right-0 h-full w-[min(22rem,86vw)] overflow-y-auto border-l border-[#f3dfd8] bg-white p-5 shadow-[0_18px_40px_rgba(146,101,101,0.18)]">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-[#f598a8] text-white shadow-[0_10px_20px_rgba(245,152,168,0.24)]">
                  <MessageSquareText className="size-6" />
                </div>
                <div>
                  <p className="text-lg font-bold tracking-tight text-[#5d4037]">
                    우리반 생각보드
                  </p>
                  <p className="text-xs text-[#8d6e63]">주제 카테고리</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="inline-flex size-10 items-center justify-center rounded-2xl border border-[#f0dedd] bg-[#fff7f5] text-[#8d6e63]"
                aria-label="사이드바 닫기"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-5">
              <StudentProfileCard
                profile={profile}
                compact
                onEdit={() => {
                  setSidebarOpen(false);
                  setProfileSheetOpen(true);
                }}
              />
            </div>

            <div className="mt-6">
              <TopicNavigation topics={topics} activeTopicId={topic.id} hrefBase="/topics" />
            </div>
          </aside>
        </div>
      ) : null}

      <StudentProfileSheet
        open={isHydrated && profileSheetOpen}
        onClose={() => setProfileSheetOpen(false)}
        onSave={handleSaveProfile}
        initialProfile={profile}
        forceOpen={isHydrated && !profile}
      />
    </>
  );
}
