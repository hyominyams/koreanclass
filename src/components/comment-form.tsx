"use client";

import { useActionState, useEffect, useRef } from "react";
import { CheckCircle2, LoaderCircle, MessageSquarePlus, TriangleAlert } from "lucide-react";
import { useFormStatus } from "react-dom";

import { type ActionState, createCommentAction } from "@/app/actions";
import {
  getStudentProfileGradeClass,
  type StudentProfile,
} from "@/lib/student-profile";

type CommentFormProps = {
  topicId: string;
  submissionId: string;
  enabled: boolean;
  profile: StudentProfile | null;
};

const initialState: ActionState = {
  status: "idle",
};

function CommentSubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full bg-[#f598a8] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#ef8799] disabled:cursor-not-allowed disabled:bg-[#d9c5c1] sm:w-auto"
      disabled={pending || disabled}
    >
      {pending ? (
        <LoaderCircle className="size-4 animate-spin" />
      ) : (
        <MessageSquarePlus className="size-4" />
      )}
      {pending ? "등록 중..." : "댓글 남기기"}
    </button>
  );
}

export function CommentForm({
  topicId,
  submissionId,
  enabled,
  profile,
}: CommentFormProps) {
  const [state, formAction] = useActionState(createCommentAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3 rounded-[1.5rem] border border-[#f0dedd] bg-white p-4">
      <input type="hidden" name="topicId" value={topicId} />
      <input type="hidden" name="submissionId" value={submissionId} />
      <input
        type="hidden"
        name="commenterName"
        value={profile?.authorName ?? ""}
      />
      <input
        type="hidden"
        name="commenterGradeClass"
        value={profile ? getStudentProfileGradeClass(profile) : ""}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        {profile ? (
          <div className="inline-flex items-center gap-2 rounded-full bg-[#fff5f4] px-3 py-1.5 text-xs font-semibold text-[#8d6e63]">
            <span className="flex size-7 items-center justify-center rounded-full bg-white text-[#9c6b5b] ring-1 ring-[#f2c7bf]">
              {profile.authorName.slice(0, 1)}
            </span>
            <span>
              {getStudentProfileGradeClass(profile)} · {profile.authorName}
            </span>
          </div>
        ) : (
          <div className="rounded-full bg-[#fff1f4] px-3 py-1.5 text-xs font-semibold text-[#9c5f6c]">
            학생 정보를 먼저 입력해 주세요.
          </div>
        )}

        <CommentSubmitButton disabled={!enabled || !profile} />
      </div>

      {state.status !== "idle" ? (
        <div
          className={`flex items-start gap-3 rounded-[1.25rem] border px-4 py-3 text-sm leading-6 ${
            state.status === "success"
              ? "border-[#d6eadf] bg-[#eff9f3] text-[#4f7b61]"
              : "border-[#f2cfd7] bg-[#fff1f4] text-[#9c5f6c]"
          }`}
        >
          {state.status === "success" ? (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          ) : (
            <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          )}
          <p>{state.message}</p>
        </div>
      ) : null}

      <textarea
        id={`comment-content-${submissionId}`}
        name="content"
        rows={3}
        className="w-full rounded-2xl border border-[#ecd8d2] bg-white px-4 py-3 text-sm text-[#5d4037] outline-none transition focus:border-[#f29cab] focus:ring-4 focus:ring-[#fde6eb] disabled:cursor-not-allowed disabled:bg-[#f7eeeb] disabled:text-[#b8a19a]"
        placeholder="공감한 점이나 더 묻고 싶은 점을 짧게 남겨 보세요."
        disabled={!enabled || !profile}
      />
    </form>
  );
}
