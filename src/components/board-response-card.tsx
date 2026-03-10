import { Heart, MessageCircleMore, Send } from "lucide-react";

import { addHeartAction } from "@/app/actions";
import { CommentForm } from "@/components/comment-form";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type ResponseItem, formatKoreanDateTime } from "@/lib/discussions";

type BoardResponseCardProps = {
  topicId: string;
  response: ResponseItem;
  interactionsEnabled: boolean;
};

export function BoardResponseCard({
  topicId,
  response,
  interactionsEnabled,
}: BoardResponseCardProps) {
  return (
    <Card className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/95 py-0 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
      <CardHeader className="gap-4 border-b border-slate-200/70 px-5 py-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar size="lg" className="bg-sky-50">
              <AvatarFallback className="bg-sky-50 text-sky-900">
                {response.author.slice(0, 1)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <CardTitle className="text-base text-slate-900">{response.author}</CardTitle>
              <p className="text-sm text-slate-500">
                {response.gradeClass} · {formatKoreanDateTime(response.submittedAt)}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="rounded-full border-slate-200 bg-slate-50">
            공개 글
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4 px-5 py-5">
        <p className="whitespace-pre-wrap text-sm leading-7 text-slate-800">
          {response.content}
        </p>

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

        <div className="grid grid-cols-2 gap-3 rounded-[1.5rem] bg-slate-50 p-4 ring-1 ring-slate-200/70">
          <form action={addHeartAction}>
            <input type="hidden" name="topicId" value={topicId} />
            <input type="hidden" name="submissionId" value={response.id} />
            <Button
              type="submit"
              variant="ghost"
              className="h-auto w-full justify-start rounded-[1rem] px-3 py-3 text-left"
              disabled={!interactionsEnabled}
            >
              <Heart className="size-4 text-rose-500" />
              하트 {response.heartCount}
            </Button>
          </form>
          <div className="flex items-center gap-2 rounded-[1rem] bg-white px-3 py-3 text-sm font-medium text-slate-700 ring-1 ring-slate-200">
            <MessageCircleMore className="size-4 text-slate-500" />
            댓글 {response.commentCount}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Send className="size-4 text-slate-500" />
            댓글
          </div>

          {response.comments.length === 0 ? (
            <div className="rounded-[1.25rem] border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500">
              아직 댓글이 없습니다. 첫 댓글을 남겨 보세요.
            </div>
          ) : (
            <div className="space-y-3">
              {response.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-[1.25rem] bg-slate-50 px-4 py-3 ring-1 ring-slate-200/70"
                >
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-semibold text-slate-900">{comment.author}</span>
                    <span className="text-slate-500">{comment.gradeClass}</span>
                    <span className="text-slate-400">
                      {formatKoreanDateTime(comment.createdAt)}
                    </span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="border-t border-slate-200/70 px-5 py-5">
        <div className="w-full">
          <CommentForm
            topicId={topicId}
            submissionId={response.id}
            enabled={interactionsEnabled}
          />
        </div>
      </CardFooter>
    </Card>
  );
}
