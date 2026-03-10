"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  CheckCircle2,
  LoaderCircle,
  PencilLine,
  TriangleAlert,
} from "lucide-react";
import { useFormStatus } from "react-dom";

import { type ActionState, submitResponseAction } from "@/app/actions";
import type { StudentProfile } from "@/lib/student-profile";

type SubmissionFormProps = {
  topicId: string;
  topicTitle: string;
  submissionsEnabled: boolean;
  profile: StudentProfile | null;
  onSuccess?: () => void;
};

const initialState: ActionState = {
  status: "idle",
};

const textareaClassName =
  "w-full rounded-2xl border border-[#ecd8d2] bg-[#fff7f5] px-4 py-3 text-base text-[#5d4037] outline-none transition focus:border-[#f29cab] focus:bg-white focus:ring-4 focus:ring-[#fde6eb] disabled:cursor-not-allowed disabled:bg-[#f7eeeb] disabled:text-[#b8a19a] sm:text-sm";

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#f598a8] px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(245,152,168,0.28)] transition hover:bg-[#ef8799] disabled:cursor-not-allowed disabled:bg-[#d9c5c1] disabled:shadow-none sm:w-auto"
      disabled={pending || disabled}
    >
      {pending ? (
        <LoaderCircle className="size-4 animate-spin" />
      ) : (
        <PencilLine className="size-4" />
      )}
      {pending ? "게시 중..." : "게시물 올리기"}
    </button>
  );
}

export function SubmissionForm({
  topicId,
  topicTitle,
  submissionsEnabled,
  profile,
  onSuccess,
}: SubmissionFormProps) {
  const [state, formAction] = useActionState(submitResponseAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
      onSuccess?.();
    }
  }, [onSuccess, state.status]);

  return (
    <div className="space-y-5">
      <div className="rounded-[1.5rem] border border-[#efd7d7] bg-[#fff5f4] px-4 py-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#b08a80]">
          현재 작성 주제
        </p>
        <p className="mt-1 text-sm font-semibold text-[#5d4037]">{topicTitle}</p>
      </div>

      {profile ? (
        <div className="flex items-center gap-3 rounded-[1.5rem] border border-[#f0dedd] bg-white px-4 py-3">
          <div className="flex size-11 items-center justify-center rounded-full border-2 border-[#f2c7bf] bg-[#fff0ec] text-sm font-bold text-[#9c6b5b]">
            {profile.authorName.slice(0, 1)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#5d4037]">
              {profile.authorName} 학생
            </p>
            <p className="truncate text-xs text-[#8d6e63]">{profile.gradeClass}</p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 rounded-[1.5rem] border border-[#f2cfd7] bg-[#fff1f4] px-4 py-4 text-sm leading-6 text-[#9c5f6c]">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          <p>학생 정보가 없어 글을 작성할 수 없습니다. 학년 반과 이름을 먼저 설정해 주세요.</p>
        </div>
      )}

      {!submissionsEnabled ? (
        <div className="flex items-start gap-3 rounded-[1.5rem] border border-[#f2cfd7] bg-[#fff1f4] px-4 py-4 text-sm leading-6 text-[#9c5f6c]">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          <p>게시물 저장 설정이 아직 완료되지 않았습니다. 설정 후 다시 시도해 주세요.</p>
        </div>
      ) : null}

      {state.status !== "idle" ? (
        <div
          className={`flex items-start gap-3 rounded-[1.5rem] border px-4 py-4 text-sm leading-6 ${
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
          <div>
            <p className="font-semibold">
              {state.status === "success" ? "게시물이 등록되었습니다." : "입력 내용을 확인해 주세요."}
            </p>
            <p>{state.message}</p>
          </div>
        </div>
      ) : null}

      <form ref={formRef} action={formAction} className="space-y-6">
        <input type="hidden" name="topicId" value={topicId} />
        <input type="hidden" name="gradeClass" value={profile?.gradeClass ?? ""} />
        <input type="hidden" name="authorName" value={profile?.authorName ?? ""} />

        <label className="block">
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-[#b08a80]">
            내 생각
          </span>
          <textarea
            id={`content-${topicId}`}
            name="content"
            rows={6}
            className={`${textareaClassName} min-h-40 resize-y`}
            placeholder="교실과 주제에 대해 제안하고 싶은 내용을 자유롭게 적어주세요."
            disabled={!submissionsEnabled || !profile}
          />
        </label>

        <div className="flex flex-col gap-4 border-t border-[#f3e6e1] pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-[#aa8e84]">
            비속어나 타인을 비방하는 글은 삭제될 수 있습니다.
          </p>
          <SubmitButton disabled={!submissionsEnabled || !profile} />
        </div>
      </form>
    </div>
  );
}
