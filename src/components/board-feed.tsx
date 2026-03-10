"use client";

import { useState } from "react";

import { BoardResponseCard } from "@/components/board-response-card";
import type { ResponseItem } from "@/lib/discussions";
import type { StudentProfile } from "@/lib/student-profile";

type BoardFeedProps = {
  topicId: string;
  responses: ResponseItem[];
  interactionsEnabled: boolean;
  profile: StudentProfile | null;
};

const PAGE_SIZE = 6;

function getPopularityScore(response: ResponseItem) {
  return response.heartCount * 3 + response.commentCount * 2;
}

export function BoardFeed({
  topicId,
  responses,
  interactionsEnabled,
  profile,
}: BoardFeedProps) {
  const [sortMode, setSortMode] = useState<"latest" | "popular">("latest");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const sortedResponses = [...responses].sort((left, right) => {
    if (sortMode === "popular") {
      const scoreGap = getPopularityScore(right) - getPopularityScore(left);

      if (scoreGap !== 0) {
        return scoreGap;
      }
    }

    return (
      new Date(right.submittedAt).getTime() - new Date(left.submittedAt).getTime()
    );
  });

  const visibleResponses = sortedResponses.slice(0, visibleCount);
  const hasMore = visibleCount < sortedResponses.length;

  return (
    <section data-purpose="post-feed">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h3 className="text-2xl font-bold tracking-tight text-[#5d4037]">
            모두의 카드 보드
          </h3>
          <p className="mt-1 text-sm leading-6 text-[#8d6e63]">
            친구들의 생각을 카드처럼 모아 보고 하트와 댓글로 반응해 보세요.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex">
          <button
            type="button"
            onClick={() => {
              setSortMode("latest");
              setVisibleCount(PAGE_SIZE);
            }}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
              sortMode === "latest"
                ? "border-[#f4c5ce] bg-[#ffe9ed] text-[#ea8f9d]"
                : "border-[#eddcd7] bg-white text-[#8d6e63] hover:bg-[#fff7f5]"
            }`}
          >
            최신순
          </button>
          <button
            type="button"
            onClick={() => {
              setSortMode("popular");
              setVisibleCount(PAGE_SIZE);
            }}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
              sortMode === "popular"
                ? "border-[#f4c5ce] bg-[#ffe9ed] text-[#ea8f9d]"
                : "border-[#eddcd7] bg-white text-[#8d6e63] hover:bg-[#fff7f5]"
            }`}
          >
            인기순
          </button>
        </div>
      </div>

      {sortedResponses.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-[#ead6d0] bg-white px-6 py-14 text-center shadow-[0_10px_24px_rgba(190,146,146,0.06)]">
          <p className="text-base font-semibold text-[#5d4037]">
            아직 올라온 생각이 없습니다.
          </p>
          <p className="mt-2 text-sm leading-6 text-[#8d6e63]">
            오른쪽 아래의 + 버튼을 눌러 첫 번째 생각을 남겨 보세요.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 2xl:grid-cols-3">
            {visibleResponses.map((response) => (
              <BoardResponseCard
                key={response.id}
                topicId={topicId}
                response={response}
                interactionsEnabled={interactionsEnabled}
                profile={profile}
              />
            ))}
          </div>

          {hasMore ? (
            <div className="mt-10 text-center sm:mt-12">
              <button
                type="button"
                onClick={() => setVisibleCount((current) => current + PAGE_SIZE)}
                className="rounded-full border border-[#ead6d0] bg-white px-8 py-3 text-sm font-semibold text-[#8d6e63] shadow-sm transition-all hover:border-[#f4b7c3] hover:text-[#ef8d9c]"
              >
                더 많은 생각 보기
              </button>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
