"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Menu, X } from "lucide-react";

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
  getStudentProfileGradeClass,
  hashStudentSecret,
  STUDENT_CLASS_OPTIONS,
  STUDENT_GRADE_OPTIONS,
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

function subscribeToHydration() {
  return () => {};
}

function getHydratedSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
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
    const grade = parsed.grade?.trim();
    const classNumber = parsed.classNumber?.trim();
    const authorName = parsed.authorName?.trim();
    const secretHash = parsed.secretHash?.trim();

    if (!grade || !classNumber || !authorName || !secretHash) {
      return null;
    }

    return {
      grade,
      classNumber,
      authorName,
      secretHash,
    };
  } catch {
    return null;
  }
}

function saveProfile(profile: StudentProfile) {
  window.localStorage.setItem(STUDENT_PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

function BrandMark() {
  return (
    <div className="relative flex size-12 shrink-0 flex-col justify-center gap-1.5 rounded-[1.1rem] bg-[#ff9eaa] px-3 shadow-sm">
      <span className="h-1 rounded-full bg-white/95" />
      <span className="h-1 rounded-full bg-white/85" />
      <span className="h-1 rounded-full bg-white/75" />
      <span className="absolute right-2 bottom-2 size-1.5 rounded-full bg-white/90" />
    </div>
  );
}

function StudentProfileCard({
  profile,
  onEdit,
}: {
  profile: StudentProfile | null;
  onEdit: () => void;
}) {
  return (
    <div className="flex items-center gap-3 border-t border-[#f1dfd8] pt-6">
      <div className="flex size-12 items-center justify-center rounded-full border-2 border-[#ffd1d1] bg-[#fff3f1] text-base font-bold text-[#a47063]">
        {profile?.authorName.slice(0, 1) ?? "🙂"}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-[#5d4037]">
          {profile ? `${profile.authorName} 학생` : "학생 정보가 필요합니다"}
        </p>
        <p className="truncate text-xs text-[#8d6e63]">
          {profile ? getStudentProfileGradeClass(profile) : "학년 반과 이름을 먼저 입력해 주세요."}
        </p>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="rounded-full bg-[#fff7f5] px-3 py-1.5 text-xs font-semibold text-[#d87d8e] ring-1 ring-[#f0d9dc] transition hover:bg-white"
      >
        수정
      </button>
    </div>
  );
}

function StudentProfileSheet({
  open,
  forceOpen,
  initialProfile,
  onClose,
  onSave,
}: {
  open: boolean;
  forceOpen: boolean;
  initialProfile: StudentProfile | null;
  onClose: () => void;
  onSave: (profile: StudentProfile) => void;
}) {
  const [grade, setGrade] = useState(initialProfile?.grade ?? "1");
  const [classNumber, setClassNumber] = useState(initialProfile?.classNumber ?? "1");
  const [authorName, setAuthorName] = useState(initialProfile?.authorName ?? "");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-[#6d5148]/35 px-0 backdrop-blur-sm sm:items-center sm:px-4">
      <div className="max-h-[92vh] w-full overflow-hidden rounded-t-[2rem] bg-white shadow-[0_30px_80px_rgba(146,101,101,0.22)] sm:max-w-lg sm:rounded-[2rem]">
        <div className="flex items-start justify-between gap-4 border-b border-[#f1e2de] bg-[#fff7f5] px-5 py-5 sm:px-6">
          <div>
            <h3 className="text-lg font-bold text-[#5d4037] sm:text-xl">학생 정보 설정</h3>
            <p className="mt-2 text-sm leading-6 text-[#8d6e63]">
              학년, 반, 이름, 암호를 입력하면 이후 글쓰기와 댓글 작성에 그대로 사용됩니다.
            </p>
          </div>
          {!forceOpen ? (
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 text-[#8d6e63] transition-colors hover:text-[#5d4037]"
              aria-label="닫기"
            >
              <X className="size-6" />
            </button>
          ) : null}
        </div>

        <form
          className="space-y-5 px-5 py-5 sm:px-6"
          onSubmit={async (event) => {
            event.preventDefault();
            setErrorMessage("");

            const trimmedName = authorName.trim();

            if (!trimmedName) {
              setErrorMessage("이름을 입력해 주세요.");
              return;
            }

            if (trimmedName.length > 24) {
              setErrorMessage("이름은 24자 이하로 입력해 주세요.");
              return;
            }

            if (password.length < 4) {
              setErrorMessage("암호는 4자 이상 입력해 주세요.");
              return;
            }

            if (password !== passwordConfirm) {
              setErrorMessage("암호와 암호확인이 일치하지 않습니다.");
              return;
            }

            setIsSaving(true);

            try {
              const secretHash = await hashStudentSecret(password);
              onSave({
                grade,
                classNumber,
                authorName: trimmedName,
                secretHash,
              });
            } finally {
              setIsSaving(false);
            }
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-[#b08a80]">
                학년
              </span>
              <select
                value={grade}
                onChange={(event) => setGrade(event.target.value)}
                className="w-full rounded-2xl border border-[#ecd8d2] bg-[#fff7f5] px-4 py-3 text-base text-[#5d4037] outline-none transition focus:border-[#f29cab] focus:bg-white focus:ring-4 focus:ring-[#fde6eb]"
              >
                {STUDENT_GRADE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}학년
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-[#b08a80]">
                반
              </span>
              <select
                value={classNumber}
                onChange={(event) => setClassNumber(event.target.value)}
                className="w-full rounded-2xl border border-[#ecd8d2] bg-[#fff7f5] px-4 py-3 text-base text-[#5d4037] outline-none transition focus:border-[#f29cab] focus:bg-white focus:ring-4 focus:ring-[#fde6eb]"
              >
                {STUDENT_CLASS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}반
                  </option>
                ))}
              </select>
            </label>
          </div>

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

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-[#b08a80]">
                암호
              </span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-[#ecd8d2] bg-[#fff7f5] px-4 py-3 text-base text-[#5d4037] outline-none transition focus:border-[#f29cab] focus:bg-white focus:ring-4 focus:ring-[#fde6eb]"
                placeholder="4자 이상 입력"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-[#b08a80]">
                암호확인
              </span>
              <input
                type="password"
                value={passwordConfirm}
                onChange={(event) => setPasswordConfirm(event.target.value)}
                className="w-full rounded-2xl border border-[#ecd8d2] bg-[#fff7f5] px-4 py-3 text-base text-[#5d4037] outline-none transition focus:border-[#f29cab] focus:bg-white focus:ring-4 focus:ring-[#fde6eb]"
                placeholder="한 번 더 입력"
              />
            </label>
          </div>

          {errorMessage ? (
            <p className="rounded-2xl border border-[#f2cfd7] bg-[#fff1f4] px-4 py-3 text-sm text-[#9c5f6c]">
              {errorMessage}
            </p>
          ) : null}

          <button
            type="submit"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#f598a8] px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(245,152,168,0.28)] transition hover:bg-[#ef8799] disabled:cursor-not-allowed disabled:bg-[#d9c5c1]"
            disabled={isSaving}
          >
            {isSaving ? "설정 중..." : "이 정보로 입장하기"}
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
  const isClient = useSyncExternalStore(
    subscribeToHydration,
    getHydratedSnapshot,
    getServerSnapshot
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

  const handleSaveProfile = (nextProfile: StudentProfile) => {
    saveProfile(nextProfile);
    setProfile(nextProfile);
    setProfileSheetOpen(false);
  };

  return (
    <>
      <div className="min-h-screen overflow-x-hidden bg-[#fdf8f5] text-[#5d4037] md:flex">
        <aside className="hidden w-64 shrink-0 border-r border-[#ffd1d1]/40 bg-white p-6 md:flex md:flex-col md:gap-8">
          <div className="flex items-start gap-4 rounded-[1.5rem] border border-[#f6e4df] bg-[#fffaf8] p-4">
            <BrandMark />
            <div className="min-w-0">
              <h1 className="text-[1.5rem] font-bold tracking-tight text-[#5d4037]">
                우리반 생각보드
              </h1>
              <p className="mt-1 text-[0.78rem] leading-5 text-[#8d6e63]">
                학생이 글을 쓰고, 다른 학생의 의견에 하트와 댓글을 남기며 함께 보는 공유 보드입니다.
              </p>
            </div>
          </div>

          <div>
            <p className="mb-3 px-2 text-xs font-bold uppercase tracking-[0.2em] text-[#8d6e63]">
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
        </aside>

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 md:hidden">
            <div className="rounded-[1.5rem] border border-[#ffd1d1]/40 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <BrandMark />
                  <div className="min-w-0">
                    <h1 className="text-xl font-bold tracking-tight text-[#5d4037]">
                      우리반 생각보드
                    </h1>
                    <p className="mt-1 text-xs leading-5 text-[#8d6e63]">{board.subtitle}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="inline-flex size-11 items-center justify-center rounded-2xl border border-[#ffd1d1]/40 bg-[#fff7f5] text-[#8d6e63]"
                  aria-label="사이드바 열기"
                >
                  <Menu className="size-5" />
                </button>
              </div>

              {isClient ? (
                <div className="mt-4">
                  <StudentProfileCard
                    profile={profile}
                    onEdit={() => setProfileSheetOpen(true)}
                  />
                </div>
              ) : null}
            </div>
          </div>

          <section className="px-4 pb-24 md:px-10 md:py-10" data-purpose="hero-topic-header">
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#ffd1d1]/55 to-[#ff9eaa]/20 px-6 py-8 md:rounded-[2rem] md:px-12 md:py-12">
              <div className="absolute -top-12 -right-12 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
              <div className="relative z-10 max-w-3xl">
                <span className="inline-flex rounded-full bg-[#ff9eaa] px-3 py-1 text-xs font-bold text-white">
                  현재 진행 중인 토론
                </span>
                <h2 className="mt-5 text-3xl font-bold leading-tight text-[#5d4037] md:text-5xl">
                  {topic.title}
                </h2>
                <p className="mt-5 text-base leading-8 text-[#8d6e63] md:text-lg">
                  {topic.prompt}
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-4 text-sm font-medium text-[#8d6e63]">
                  <span className="flex items-center gap-1">🗓️ 최근 활동 {latestActivity}</span>
                  <span className="flex items-center gap-1">💬 {responses.length}개의 생각들</span>
                  <span className="flex items-center gap-1">👥 {participantCount}명 참여</span>
                </div>
              </div>
            </div>
          </section>

          <section className="px-4 pb-24 md:px-10" data-purpose="thoughts-grid">
            <BoardFeed
              topicId={topic.id}
              responses={responses}
              interactionsEnabled={interactionsEnabled}
              profile={profile}
            />
          </section>
        </main>
      </div>

      <FloatingSubmissionButton
        topicId={topic.id}
        topicTitle={topic.title}
        topicPrompt={topic.prompt}
        submissionsEnabled={submissionsEnabled}
        profile={profile}
      />

      {sidebarOpen ? (
        <div className="fixed inset-0 z-[60] md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-[#6d5148]/35 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
            aria-label="사이드바 닫기"
          />
          <aside className="absolute top-0 right-0 flex h-full w-[min(22rem,86vw)] flex-col gap-6 border-l border-[#ffd1d1]/40 bg-white p-5 shadow-[0_18px_40px_rgba(146,101,101,0.18)]">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <BrandMark />
                <div>
                  <p className="text-lg font-bold tracking-tight text-[#5d4037]">
                    우리반 생각보드
                  </p>
                  <p className="mt-1 text-xs text-[#8d6e63]">주제 카테고리</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="inline-flex size-10 items-center justify-center rounded-2xl border border-[#ffd1d1]/40 bg-[#fff7f5] text-[#8d6e63]"
                aria-label="사이드바 닫기"
              >
                <X className="size-5" />
              </button>
            </div>

            <TopicNavigation topics={topics} activeTopicId={topic.id} hrefBase="/topics" />

            <div className="mt-auto">
              <StudentProfileCard
                profile={profile}
                onEdit={() => {
                  setSidebarOpen(false);
                  setProfileSheetOpen(true);
                }}
              />
            </div>
          </aside>
        </div>
      ) : null}

      <StudentProfileSheet
        key={
          profile
            ? `${profile.grade}-${profile.classNumber}-${profile.authorName}-${profileSheetOpen ? "open" : "closed"}`
            : `empty-${profileSheetOpen ? "open" : "closed"}`
        }
        open={isClient && profileSheetOpen}
        forceOpen={isClient && !profile}
        initialProfile={profile}
        onClose={() => setProfileSheetOpen(false)}
        onSave={handleSaveProfile}
      />
    </>
  );
}
