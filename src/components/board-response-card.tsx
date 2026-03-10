"use client";

import { useState } from "react";
import { Heart, MessageCircleMore } from "lucide-react";

import { addHeartAction } from "@/app/actions";
import { CommentForm } from "@/components/comment-form";
import { type ResponseItem, formatKoreanDateTime } from "@/lib/discussions";
import type { StudentProfile } from "@/lib/student-profile";

type BoardResponseCardProps = {
  topicId: string;
  response: ResponseItem;
  interactionsEnabled: boolean;
  profile: StudentProfile | null;
};

const authorStyles = [
  { emoji: "👨‍🚀", tint: "text-[#b9786a]" },
  { emoji: "👩‍⚕️", tint: "text-[#d1778e]" },
  { emoji: "🎨", tint: "text-[#c19159]" },
  { emoji: "🍰", tint: "text-[#bc7d8a]" },
  { emoji: "🪴", tint: "text-[#7fa68b]" },
  { emoji: "🧁", tint: "text-[#c88b73]" },
];

function getAuthorStyle(seed: string) {
  const charCode = seed.charCodeAt(0) || 0;
  return authorStyles[charCode % authorStyles.length];
}

function getRelativeLabel(dateValue: string) {
  const targetDate = new Date(dateValue);
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfTarget = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate()
  );
  const diffDays = Math.floor(
    (startOfToday.getTime() - startOfTarget.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays <= 0) {
    return "오늘";
  }

  if (diffDays === 1) {
    return "어제";
  }

  if (diffDays <= 7) {
    return `${diffDays}일 전`;
  }

  return formatKoreanDateTime(dateValue);
}

export function BoardResponseCard({
  topicId,
  response,
  interactionsEnabled,
  profile,
}: BoardResponseCardProps) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const authorStyle = getAuthorStyle(response.author);

  return (
    <article className="flex h-full flex-col rounded-[1.75rem] border border-[#f1dfda] bg-white p-5 shadow-[0_10px_24px_rgba(190,146,146,0.08)] transition-shadow hover:shadow-[0_18px_36px_rgba(190,146,146,0.12)] sm:rounded-[2rem] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className={`text-3xl ${authorStyle.tint}`}>{authorStyle.emoji}</span>
          <div className="min-w-0">
            <p className="truncate text-lg font-bold tracking-tight text-[#5d4037]">
              {response.author}
            </p>
            <p className="text-xs text-[#8d6e63]">{response.gradeClass}</p>
          </div>
        </div>

        <span className="rounded-full bg-[#fbf2ef] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-[#a88579]">
          {getRelativeLabel(response.submittedAt)}
        </span>
      </div>

      <p className="mt-4 flex-1 whitespace-pre-wrap text-base leading-8 text-[#5d4037] sm:mt-5">
        {response.content}
      </p>

      {response.keywords.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2 sm:mt-5">
          {response.keywords.map((keyword) => (
            <span
              key={keyword}
              className="rounded-full bg-[#fff3f4] px-3 py-1 text-[11px] font-semibold text-[#d37c8d]"
            >
              #{keyword}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-5 border-t border-[#f5ebe6] pt-4 sm:mt-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <form action={addHeartAction}>
              <input type="hidden" name="topicId" value={topicId} />
              <input type="hidden" name="submissionId" value={response.id} />
              <button
                type="submit"
                className="inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-[#8d6e63] transition-colors hover:text-[#ef8d9c] disabled:cursor-not-allowed disabled:text-[#ccb5ad]"
                disabled={!interactionsEnabled}
              >
                <Heart className="size-5" />
                <span>{response.heartCount}</span>
              </button>
            </form>

            <span className="inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-[#8d6e63]">
              <MessageCircleMore className="size-5" />
              <span>{response.commentCount}</span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => setCommentsOpen((current) => !current)}
            className="self-start text-sm font-bold text-[#f098a7] transition-colors hover:text-[#e97f91] sm:self-auto"
          >
            {commentsOpen ? "댓글 접기" : "댓글 보기"}
          </button>
        </div>

        {commentsOpen ? (
          <div className="mt-4 space-y-4 rounded-[1.5rem] border border-[#f2e3de] bg-[#fff8f7] p-4 sm:mt-5 sm:rounded-[1.75rem]">
            {response.comments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#ead6d0] bg-white px-4 py-3 text-sm text-[#8d6e63]">
                아직 댓글이 없습니다. 첫 댓글을 남겨 보세요.
              </div>
            ) : (
              <div className="space-y-3">
                {response.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="rounded-2xl border border-[#f3e6e1] bg-white px-4 py-3 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#b08a80]">
                      <span className="font-semibold text-[#5d4037]">{comment.author}</span>
                      <span>{comment.gradeClass}</span>
                      <span>{formatKoreanDateTime(comment.createdAt)}</span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#6b4d45]">
                      {comment.content}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {!interactionsEnabled ? (
              <div className="rounded-2xl border border-[#f1d5b7] bg-[#fff3df] px-4 py-3 text-sm leading-6 text-[#8b603f]">
                댓글 작성 기능이 아직 준비되지 않았지만, 기존 댓글은 읽을 수 있습니다.
              </div>
            ) : null}

            <CommentForm
              topicId={topicId}
              submissionId={response.id}
              enabled={interactionsEnabled}
              profile={profile}
            />
          </div>
        ) : null}
      </div>
    </article>
  );
}
