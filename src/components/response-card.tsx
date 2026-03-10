import { Clock3, MessageSquareQuote } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ResponseItem, formatKoreanDateTime } from "@/lib/discussions";
import { cn } from "@/lib/utils";

type ResponseCardProps = {
  response: ResponseItem;
  topicLabel?: string;
};

function getPerspectiveBadgeTone(perspective: string) {
  if (perspective.includes("학생") || perspective.includes("경험")) {
    return "border-amber-200 bg-amber-50 text-amber-900";
  }

  if (perspective.includes("교사") || perspective.includes("수업")) {
    return "border-sky-200 bg-sky-50 text-sky-900";
  }

  if (perspective.includes("규칙") || perspective.includes("운영")) {
    return "border-slate-200 bg-slate-100 text-slate-800";
  }

  return "border-emerald-200 bg-emerald-50 text-emerald-900";
}

export function ResponseCard({ response, topicLabel }: ResponseCardProps) {
  return (
    <Card className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/95 py-0 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
      <CardHeader className="gap-4 border-b border-slate-200/70 px-5 py-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar size="lg" className="bg-slate-100">
              <AvatarFallback className="bg-slate-100 text-slate-700">
                {response.author.slice(0, 1)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <CardTitle className="text-base">{response.author}</CardTitle>
              <p className="inline-flex items-center gap-1.5 text-sm text-slate-500">
                <Clock3 className="size-3.5" />
                {formatKoreanDateTime(response.submittedAt)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            {topicLabel ? (
              <Badge variant="outline" className="rounded-full border-slate-200 bg-white">
                {topicLabel}
              </Badge>
            ) : null}
            <Badge
              variant="outline"
              className={cn(
                "rounded-full border px-3 py-1 text-xs",
                getPerspectiveBadgeTone(response.perspective)
              )}
            >
              {response.perspective}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 px-5 py-5">
        <div className="rounded-[1.5rem] bg-slate-50 px-5 py-4 ring-1 ring-slate-200/70">
          <div className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500">
            <MessageSquareQuote className="size-4" />
            학생이 남긴 생각
          </div>
          <p className="whitespace-pre-wrap text-sm leading-7 text-slate-800">
            {response.content}
          </p>
        </div>

        {response.keywords.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {response.keywords.map((keyword) => (
              <Badge
                key={keyword}
                variant="secondary"
                className="rounded-full bg-slate-100 text-slate-700"
              >
                #{keyword}
              </Badge>
            ))}
          </div>
        ) : null}
      </CardContent>

      <CardFooter className="justify-between border-t border-slate-200/70 px-5 py-4 text-xs text-slate-500">
        <span>응답 ID {response.id}</span>
        <span>익명 제출 기록</span>
      </CardFooter>
    </Card>
  );
}
