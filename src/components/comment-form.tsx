"use client";

import { useActionState, useEffect, useRef } from "react";
import { CheckCircle2, LoaderCircle, MessageSquarePlus, TriangleAlert } from "lucide-react";
import { useFormStatus } from "react-dom";

import { type ActionState, createCommentAction } from "@/app/actions";

type CommentFormProps = {
  topicId: string;
  submissionId: string;
  enabled: boolean;
};

const initialState: ActionState = {
  status: "idle",
};

const fieldClassName =
  "w-full rounded-2xl border border-[#ecd8d2] bg-white px-4 py-3 text-sm text-[#5d4037] outline-none transition focus:border-[#f29cab] focus:ring-4 focus:ring-[#fde6eb] disabled:cursor-not-allowed disabled:bg-[#f7eeeb] disabled:text-[#b8a19a]";

function CommentSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#f598a8] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#ef8799] disabled:cursor-not-allowed disabled:bg-[#d9c5c1]"
      disabled={pending}
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

export function CommentForm({ topicId, submissionId, enabled }: CommentFormProps) {
  const [state, formAction] = useActionState(createCommentAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <input type="hidden" name="topicId" value={topicId} />
      <input type="hidden" name="submissionId" value={submissionId} />

      {state.status !== "idle" ? (
        <div
          className={`flex items-start gap-3 rounded-[1.5rem] border px-4 py-3 text-sm leading-6 ${
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

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-[#b08a80]">
            학급 정보
          </span>
          <input
            id={`comment-grade-${submissionId}`}
            name="commenterGradeClass"
            defaultValue="6학년 1반"
            className={fieldClassName}
            disabled={!enabled}
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-[#b08a80]">
            이름
          </span>
          <input
            id={`comment-name-${submissionId}`}
            name="commenterName"
            placeholder="댓글 작성자"
            className={fieldClassName}
            disabled={!enabled}
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-[#b08a80]">
          댓글
        </span>
        <textarea
          id={`comment-content-${submissionId}`}
          name="content"
          rows={3}
          className={`${fieldClassName} min-h-24 resize-y`}
          placeholder="공감한 점이나 더 묻고 싶은 점을 남겨 보세요."
          disabled={!enabled}
        />
      </label>

      <div className="flex justify-end">
        <CommentSubmitButton />
      </div>
    </form>
  );
}
