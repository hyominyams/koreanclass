"use client";

import { useActionState, useState } from "react";

import {
  type ActionState,
  deleteSubmissionAction,
  updateSubmissionAction,
} from "@/app/actions";
import { hashStudentSecret } from "@/lib/student-profile";

type SubmissionOwnerActionsProps = {
  topicId: string;
  submissionId: string;
  initialContent: string;
};

const initialState: ActionState = {
  status: "idle",
};

export function SubmissionOwnerActions({
  topicId,
  submissionId,
  initialContent,
}: SubmissionOwnerActionsProps) {
  const [mode, setMode] = useState<"idle" | "edit" | "delete">("idle");

  const [editState, editFormAction] = useActionState(
    async (_previousState: ActionState, formData: FormData) => {
      const password = String(formData.get("password") ?? "").trim();

      if (!password) {
        return {
          status: "error",
          message: "암호를 입력해 주세요.",
        } satisfies ActionState;
      }

      formData.set("secretHash", await hashStudentSecret(password));
      formData.delete("password");

      return updateSubmissionAction(_previousState, formData);
    },
    initialState
  );

  const [deleteState, deleteFormAction] = useActionState(
    async (_previousState: ActionState, formData: FormData) => {
      const password = String(formData.get("password") ?? "").trim();

      if (!password) {
        return {
          status: "error",
          message: "암호를 입력해 주세요.",
        } satisfies ActionState;
      }

      formData.set("secretHash", await hashStudentSecret(password));
      formData.delete("password");

      return deleteSubmissionAction(_previousState, formData);
    },
    initialState
  );

  return (
    <div className="mt-4 space-y-3 rounded-[1.5rem] border border-[#f3e6e1] bg-[#fff8f7] p-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setMode("edit")}
          className="rounded-full bg-[#fff0f3] px-3 py-1.5 text-xs font-semibold text-[#e28697] transition hover:bg-[#ffe6eb]"
        >
          수정
        </button>
        <button
          type="button"
          onClick={() => setMode("delete")}
          className="rounded-full bg-[#fff0ec] px-3 py-1.5 text-xs font-semibold text-[#c77d6a] transition hover:bg-[#ffe8e1]"
        >
          삭제
        </button>
        {mode !== "idle" ? (
          <button
            type="button"
            onClick={() => setMode("idle")}
            className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#8d6e63] ring-1 ring-[#ead6d0] transition hover:bg-[#fffaf8]"
          >
            닫기
          </button>
        ) : null}
      </div>

      {mode === "edit" ? (
        <form key={initialContent} action={editFormAction} className="space-y-3">
          <input type="hidden" name="topicId" value={topicId} />
          <input type="hidden" name="submissionId" value={submissionId} />

          <textarea
            name="content"
            defaultValue={initialContent}
            rows={4}
            className="w-full rounded-2xl border border-[#ecd8d2] bg-white px-4 py-3 text-sm text-[#5d4037] outline-none transition focus:border-[#f29cab] focus:ring-4 focus:ring-[#fde6eb]"
          />

          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
            <input
              name="password"
              type="password"
              placeholder="작성할 때 쓴 암호 확인"
              className="w-full rounded-2xl border border-[#ecd8d2] bg-white px-4 py-3 text-sm text-[#5d4037] outline-none transition focus:border-[#f29cab] focus:ring-4 focus:ring-[#fde6eb]"
            />
            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-[#f598a8] px-5 text-sm font-semibold text-white transition hover:bg-[#ef8799]"
            >
              수정 저장
            </button>
          </div>

          {editState.status !== "idle" ? (
            <p
              className={`rounded-2xl px-4 py-3 text-sm ${
                editState.status === "success"
                  ? "bg-[#eff9f3] text-[#4f7b61]"
                  : "bg-[#fff1f4] text-[#9c5f6c]"
              }`}
            >
              {editState.message}
            </p>
          ) : null}
        </form>
      ) : null}

      {mode === "delete" ? (
        <form action={deleteFormAction} className="space-y-3">
          <input type="hidden" name="topicId" value={topicId} />
          <input type="hidden" name="submissionId" value={submissionId} />

          <p className="text-sm leading-6 text-[#8d6e63]">
            게시글을 삭제하려면 작성할 때 사용한 암호를 다시 입력해 주세요.
          </p>

          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
            <input
              name="password"
              type="password"
              placeholder="암호 확인"
              className="w-full rounded-2xl border border-[#ecd8d2] bg-white px-4 py-3 text-sm text-[#5d4037] outline-none transition focus:border-[#f29cab] focus:ring-4 focus:ring-[#fde6eb]"
            />
            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-[#d78673] px-5 text-sm font-semibold text-white transition hover:bg-[#c5725d]"
            >
              게시글 삭제
            </button>
          </div>

          {deleteState.status !== "idle" ? (
            <p
              className={`rounded-2xl px-4 py-3 text-sm ${
                deleteState.status === "success"
                  ? "bg-[#eff9f3] text-[#4f7b61]"
                  : "bg-[#fff1f4] text-[#9c5f6c]"
              }`}
            >
              {deleteState.message}
            </p>
          ) : null}
        </form>
      ) : null}
    </div>
  );
}
