"use client";

import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";

import { SubmissionForm } from "@/components/submission-form";

type FloatingSubmissionButtonProps = {
  topicId: string;
  topicTitle: string;
  topicPrompt: string;
  submissionsEnabled: boolean;
};

export function FloatingSubmissionButton({
  topicId,
  topicTitle,
  topicPrompt,
  submissionsEnabled,
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
      <div className="group fixed right-8 bottom-8 z-30">
        <button
          type="button"
          onClick={() => setOpen(true)}
          title="내 생각 남기기"
          className="flex size-16 items-center justify-center rounded-full bg-[#f598a8] text-white shadow-[0_18px_34px_rgba(245,152,168,0.38)] transition-all hover:-translate-y-1 hover:bg-[#ef8799] hover:shadow-[0_22px_40px_rgba(245,152,168,0.42)]"
        >
          <Plus className="size-8 transition-transform duration-300 group-hover:rotate-90" />
        </button>

        <span className="pointer-events-none absolute right-20 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-xl bg-[#5d4037] px-3 py-1.5 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
          내 생각 남기기
        </span>
      </div>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#6d5148]/35 px-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-xl overflow-hidden rounded-[2rem] border border-[#f0dedd] bg-white shadow-[0_30px_80px_rgba(146,101,101,0.22)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-[#f1e2de] bg-[#fff7f5] px-6 py-5 md:px-8">
              <div>
                <h3 className="text-xl font-bold text-[#5d4037]">새 의견 작성하기</h3>
                <p className="mt-2 text-sm leading-6 text-[#8d6e63]">{topicPrompt}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-[#b08a80] transition-colors hover:text-[#8d6e63]"
                aria-label="모달 닫기"
              >
                <X className="size-6" />
              </button>
            </div>

            <div className="p-6 md:p-8">
              <SubmissionForm
                topicId={topicId}
                topicTitle={topicTitle}
                submissionsEnabled={submissionsEnabled}
                onSuccess={() => setOpen(false)}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
