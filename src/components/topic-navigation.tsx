import Link from "next/link";
import { Heart, MessageSquareText } from "lucide-react";

import { TopicSummary } from "@/lib/discussions";
import { cn } from "@/lib/utils";

type TopicNavigationProps = {
  topics: TopicSummary[];
  activeTopicId: string;
  hrefBase?: string;
  getHref?: (topicId: string) => string;
  orientation?: "vertical" | "horizontal";
  className?: string;
};

const topicEmojis = ["🎨", "🍕", "📚", "🎈", "🌈", "🪴", "🧁", "🎮"];

function getTopicEmoji(index: number) {
  return topicEmojis[index % topicEmojis.length];
}

export function TopicNavigation({
  topics,
  activeTopicId,
  hrefBase = "/topics",
  getHref,
  orientation = "vertical",
  className,
}: TopicNavigationProps) {
  const isHorizontal = orientation === "horizontal";

  return (
    <nav
      className={cn(
        isHorizontal
          ? "flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          : "flex flex-col gap-2",
        className
      )}
    >
      {topics.map((topic, index) => {
        const href = getHref ? getHref(topic.id) : `${hrefBase}/${topic.id}`;
        const isActive = topic.id === activeTopicId;

        return (
          <Link
            key={topic.id}
            href={href}
            className={cn(
              "group rounded-2xl px-4 py-3 transition-all",
              isHorizontal ? "min-w-[15rem] shrink-0" : "w-full",
              isActive
                ? "border border-[#f0d9dc] bg-[#f9efee] text-[#5d4037] shadow-[0_10px_24px_rgba(191,149,149,0.08)]"
                : "border border-transparent text-[#8d6e63] hover:bg-[#fff6f4]"
            )}
          >
            <div className="flex items-start gap-3">
              <span className="text-[1.4rem] leading-none">{getTopicEmoji(index)}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-semibold text-[#5d4037]">
                    {topic.title}
                  </p>
                  {isActive ? (
                    <span className="rounded-full bg-[#f7c4cf] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                      Active
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#8d6e63]">
                  {topic.prompt}
                </p>
                <div className="mt-3 flex items-center gap-4 text-[11px] font-medium text-[#b08a80]">
                  <span className="inline-flex items-center gap-1">
                    <MessageSquareText className="size-3.5" />
                    {topic.responseCount}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Heart className="size-3.5" />
                    {topic.participantCount}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
