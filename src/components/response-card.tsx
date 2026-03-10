import { Heart, MessageCircleMore } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type ResponseItem, formatKoreanDateTime } from "@/lib/discussions";

type ResponseCardProps = {
  response: ResponseItem;
  topicLabel?: string;
};

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
              <p className="text-sm text-slate-500">
                {response.gradeClass} · {formatKoreanDateTime(response.submittedAt)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {topicLabel ? (
              <Badge variant="outline" className="rounded-full border-slate-200 bg-white">
                {topicLabel}
              </Badge>
            ) : null}
            <Badge variant="secondary" className="rounded-full bg-slate-100 text-slate-700">
              {response.perspective}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 px-5 py-5">
        <p className="whitespace-pre-wrap text-sm leading-7 text-slate-800">
          {response.content}
        </p>

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
      </CardContent>

      <CardFooter className="justify-between border-t border-slate-200/70 px-5 py-4 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <Heart className="size-3.5" />
          {response.heartCount}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MessageCircleMore className="size-3.5" />
          {response.commentCount}
        </span>
      </CardFooter>
    </Card>
  );
}
