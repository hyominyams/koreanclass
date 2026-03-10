import Link from "next/link";
import {
  ChevronRight,
  FolderKanban,
  MessageSquareText,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TopicSummary, formatKoreanDateTime } from "@/lib/discussions";
import { cn } from "@/lib/utils";

type TopicNavigationProps = {
  topics: TopicSummary[];
  activeTopicId: string;
  hrefBase?: string;
  getHref?: (topicId: string) => string;
};

export function TopicNavigation({
  topics,
  activeTopicId,
  hrefBase = "/write",
  getHref,
}: TopicNavigationProps) {
  return (
    <ScrollArea className="max-h-[calc(100vh-16rem)] pr-2">
      <nav className="space-y-3">
        {topics.map((topic) => {
          const isActive = topic.id === activeTopicId;
          const href = getHref ? getHref(topic.id) : `${hrefBase}/${topic.id}`;

          return (
            <Link
              key={topic.id}
              href={href}
              className={cn(
                "group block rounded-[1.5rem] border px-4 py-4 text-left transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                isActive
                  ? "border-slate-900 bg-slate-900 text-white shadow-[0_16px_40px_rgba(15,23,42,0.18)]"
                  : "border-slate-200/80 bg-white/90 text-slate-900 hover:border-slate-300 hover:bg-slate-50"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex size-8 items-center justify-center rounded-2xl",
                        isActive
                          ? "bg-white/12 text-white"
                          : "bg-slate-100 text-slate-700"
                      )}
                    >
                      <FolderKanban className="size-4" />
                    </span>
                    <Badge
                      variant={isActive ? "secondary" : "outline"}
                      className={cn(
                        "rounded-full",
                        isActive
                          ? "border-white/10 bg-white/10 text-white"
                          : "border-slate-200 bg-white text-slate-700"
                      )}
                    >
                      {topic.category}
                    </Badge>
                  </div>
                  <div>
                    <p className="line-clamp-2 text-sm font-semibold leading-6">
                      {topic.title}
                    </p>
                    <p
                      className={cn(
                        "mt-2 line-clamp-2 text-sm leading-6",
                        isActive ? "text-slate-200" : "text-slate-600"
                      )}
                    >
                      {topic.prompt}
                    </p>
                  </div>
                </div>
                <ChevronRight
                  className={cn(
                    "mt-1 size-4 shrink-0 transition-transform",
                    isActive ? "translate-x-0 text-white" : "text-slate-400 group-hover:translate-x-0.5"
                  )}
                />
              </div>

              <div
                className={cn(
                  "mt-4 flex flex-wrap items-center gap-3 text-xs",
                  isActive ? "text-slate-200" : "text-slate-500"
                )}
              >
                <span className="inline-flex items-center gap-1.5">
                  <MessageSquareText className="size-3.5" />
                  응답 {topic.responseCount}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className="size-3.5" />
                  참여 {topic.participantCount}
                </span>
              </div>

              <p
                className={cn(
                  "mt-3 text-xs",
                  isActive ? "text-slate-300" : "text-slate-500"
                )}
              >
                최근 응답 {formatKoreanDateTime(topic.latestResponseAt)}
              </p>
            </Link>
          );
        })}
      </nav>
    </ScrollArea>
  );
}
