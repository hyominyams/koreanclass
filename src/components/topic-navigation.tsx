import Link from "next/link";
import { ChevronRight, Clock3, MessageSquareText, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TopicSummary, formatKoreanDateTime } from "@/lib/discussions";
import { cn } from "@/lib/utils";

type TopicNavigationProps = {
  topics: TopicSummary[];
  activeTopicId: string;
  hrefBase?: string;
};

export function TopicNavigation({
  topics,
  activeTopicId,
  hrefBase = "/topics",
}: TopicNavigationProps) {
  return (
    <ScrollArea className="max-h-[calc(100vh-18rem)] pr-2">
      <nav className="space-y-3">
        {topics.map((topic) => {
          const isActive = topic.id === activeTopicId;

          return (
            <Link
              key={topic.id}
              href={`${hrefBase}/${topic.id}`}
              className={cn(
                "inline-flex h-auto w-full flex-col items-start justify-start rounded-2xl border px-4 py-4 text-left text-sm transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                isActive
                  ? "border-transparent bg-primary text-primary-foreground ring-1 ring-primary/20"
                  : "border-border/70 bg-background/80 text-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <div className="flex w-full items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="line-clamp-2 text-sm font-semibold leading-5">
                    {topic.title}
                  </p>
                  <Badge
                    variant={isActive ? "secondary" : "outline"}
                    className={cn(
                      "rounded-full",
                      isActive
                        ? "border-transparent bg-white/15 text-primary-foreground"
                        : ""
                    )}
                  >
                    {topic.category}
                  </Badge>
                </div>
                <ChevronRight
                  className={cn(
                    "mt-0.5 size-4 shrink-0",
                    isActive ? "opacity-100" : "opacity-40"
                  )}
                />
              </div>
              <p
                className={cn(
                  "mt-3 line-clamp-2 text-sm leading-5",
                  isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                )}
              >
                {topic.prompt}
              </p>
              <div
                className={cn(
                  "mt-4 grid w-full grid-cols-2 gap-2 text-xs",
                  isActive ? "text-primary-foreground/85" : "text-muted-foreground"
                )}
              >
                <div className="flex items-center gap-1.5">
                  <MessageSquareText className="size-3.5" />
                  응답 {topic.responseCount}
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="size-3.5" />
                  참여 {topic.participantCount}
                </div>
                <div className="col-span-2 flex items-center gap-1.5">
                  <Clock3 className="size-3.5" />
                  최근 활동 {formatKoreanDateTime(topic.latestResponseAt)}
                </div>
              </div>
            </Link>
          );
        })}
      </nav>
    </ScrollArea>
  );
}
