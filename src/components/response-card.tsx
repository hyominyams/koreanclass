import { MessageSquareQuote } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ResponseItem, formatKoreanDateTime } from "@/lib/discussions";
import { cn } from "@/lib/utils";

type ResponseCardProps = {
  response: ResponseItem;
};

function getPerspectiveBadgeTone(perspective: string) {
  if (perspective.includes("자율") || perspective.includes("체험")) {
    return "bg-amber-100 text-amber-900 ring-amber-200";
  }

  if (perspective.includes("규칙") || perspective.includes("형평")) {
    return "bg-slate-100 text-slate-900 ring-slate-200";
  }

  if (perspective.includes("교사") || perspective.includes("검증")) {
    return "bg-sky-100 text-sky-900 ring-sky-200";
  }

  return "bg-emerald-100 text-emerald-900 ring-emerald-200";
}

export function ResponseCard({ response }: ResponseCardProps) {
  return (
    <Card className="h-full rounded-3xl bg-card/95 ring-1 ring-foreground/8">
      <CardHeader className="gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar size="lg" className="bg-secondary">
              <AvatarFallback>{response.author.slice(0, 1)}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <CardTitle className="text-base">{response.author}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {response.group} · {formatKoreanDateTime(response.submittedAt)}
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "rounded-full border-transparent px-3 py-1 text-xs ring-1",
              getPerspectiveBadgeTone(response.perspective)
            )}
          >
            {response.perspective}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-2xl bg-muted/60 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <MessageSquareQuote className="size-4" />
            학생 의견
          </div>
          <p className="text-sm leading-7 text-foreground/90">{response.content}</p>
        </div>
        <Separator />
        <div className="flex flex-wrap gap-2">
          {response.keywords.map((keyword) => (
            <Badge key={keyword} variant="secondary" className="rounded-full">
              #{keyword}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="justify-between rounded-b-3xl bg-transparent pt-0 text-xs text-muted-foreground">
        <span>응답 ID {response.id}</span>
        <span>교사 화면에서 날짜별로 집계됨</span>
      </CardFooter>
    </Card>
  );
}
