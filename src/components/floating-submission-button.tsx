"use client";

import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";

import { SubmissionForm } from "@/components/submission-form";
import type { StudentProfile } from "@/lib/student-profile";

type FloatingSubmissionButtonProps = {
  topicId: string;
  topicTitle: string;
  topicPrompt: string;
  submissionsEnabled: boolean;
  profile: StudentProfile | null;
};

export function FloatingSubmissionButton({
  topicId,
  topicTitle,
  topicPrompt,
  submissionsEnabled,
  profile,
}: FloatingSubmissionButtonProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <>
      <div
        className="group fixed right-4 z-30 sm:right-8"
        style={{ bottom: "calc(1rem + env(safe-area-inset-bottom))" }}
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          title="내 생각 남기기"
          className="flex size-14 items-center justify-center rounded-full bg-[#ff9eaa] text-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl sm:size-16"
        >
          <Plus className="size-7 transition-transform group-hover:rotate-90 sm:size-8" />
        </button>
        <span className="pointer-events-none absolute top-1/2 right-20 hidden -translate-y-1/2 whitespace-nowrap rounded-lg bg-[#5d4037] px-3 py-1.5 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100 md:block">
          내 생각 남기기
        </span>
      </div>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#6d5148]/35 px-0 backdrop-blur-sm sm:items-center sm:px-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[92vh] w-full overflow-hidden rounded-t-[2rem] bg-white shadow-[0_30px_80px_rgba(146,101,101,0.22)] sm:max-w-2xl sm:rounded-[2rem]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-[#f1e2de] bg-[#fff7f5] px-5 py-5 sm:px-6 md:px-8">
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-[#5d4037] sm:text-xl">새 의견 작성하기</h3>
                <p className="mt-2 text-sm leading-6 text-[#8d6e63]">{topicPrompt}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="shrink-0 text-[#8d6e63] transition-colors hover:text-[#5d4037]"
                aria-label="모달 닫기"
              >
                <X className="size-6" />
              </button>
            </div>

            <div
              className="overflow-y-auto px-5 py-5 sm:px-6 sm:py-6 md:px-8"
              style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}
            >
              <SubmissionForm
                topicId={topicId}
                topicTitle={topicTitle}
                submissionsEnabled={submissionsEnabled}
                profile={profile}
                onSuccess={() => setOpen(false)}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
