"use client";

import { useState } from "react";
import { Heart, MessageCircleMore } from "lucide-react";

import { addHeartAction } from "@/app/actions";
import { CommentForm } from "@/components/comment-form";
import { SubmissionOwnerActions } from "@/components/submission-owner-actions";
import { type ResponseItem } from "@/lib/discussions";
import {
  buildGradeClassLabel,
  type StudentProfile,
} from "@/lib/student-profile";

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
    return "Today";
  }

  if (diffDays === 1) {
    return "Yesterday";
  }

  if (diffDays <= 7) {
    return `${diffDays} days ago`;
  }

  return targetDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function BoardResponseCard({
  topicId,
  response,
  interactionsEnabled,
  profile,
}: BoardResponseCardProps) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const authorStyle = getAuthorStyle(response.author);
  const isMine = Boolean(
    profile &&
      response.author === profile.authorName &&
      response.gradeClass === buildGradeClassLabel(profile.grade, profile.classNumber)
  );

  return (
    <article className="flex h-full flex-col gap-4 rounded-[1.75rem] border border-[#f1dfda] bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={`text-[1.9rem] ${authorStyle.tint}`}>{authorStyle.emoji}</span>
          <div className="min-w-0">
            <p className="truncate text-base font-bold text-[#5d4037]">{response.author}</p>
            <p className="text-xs text-[#8d6e63]">{response.gradeClass}</p>
          </div>
        </div>
        <span className="rounded-full bg-[#fbf2ef] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.08em] text-[#a88579]">
          {getRelativeLabel(response.submittedAt)}
        </span>
      </div>

      <p className="flex-1 whitespace-pre-wrap text-base leading-8 text-[#5d4037]">
        {response.content}
      </p>

      {response.keywords.length > 0 ? (
        <div className="flex flex-wrap gap-2">
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

      <div className="mt-auto border-t border-[#f5ebe6] pt-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <form action={addHeartAction}>
              <input type="hidden" name="topicId" value={topicId} />
              <input type="hidden" name="submissionId" value={response.id} />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#8d6e63] transition-colors hover:text-[#ef8d9c] disabled:cursor-not-allowed disabled:text-[#ccb5ad]"
                disabled={!interactionsEnabled}
              >
                <Heart className="size-5" />
                <span>{response.heartCount}</span>
              </button>
            </form>
            <button
              type="button"
              onClick={() => setCommentsOpen((current) => !current)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#8d6e63] transition-colors hover:text-[#5d4037]"
            >
              <MessageCircleMore className="size-5" />
              <span>{response.commentCount}</span>
            </button>
          </div>

          {isMine ? (
            <span className="text-xs font-bold text-[#f098a7]">내 게시글</span>
          ) : (
            <button
              type="button"
              onClick={() => setCommentsOpen((current) => !current)}
              className="text-xs font-bold text-[#f098a7] hover:underline"
            >
              Read more
            </button>
          )}
        </div>

        {isMine ? (
          <SubmissionOwnerActions
            topicId={topicId}
            submissionId={response.id}
            initialContent={response.content}
          />
        ) : null}

        {commentsOpen ? (
          <div className="mt-4 space-y-4 rounded-[1.5rem] border border-[#f2e3de] bg-[#fff8f7] p-4">
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
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#6b4d45]">
                      {comment.content}
                    </p>
                  </div>
                ))}
              </div>
            )}

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
