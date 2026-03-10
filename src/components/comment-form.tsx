"use client";

import { useActionState, useEffect, useRef } from "react";
import { CheckCircle2, LoaderCircle, MessageSquarePlus, TriangleAlert } from "lucide-react";
import { useFormStatus } from "react-dom";

import { type ActionState, createCommentAction } from "@/app/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type CommentFormProps = {
  topicId: string;
  submissionId: string;
  enabled: boolean;
};

const initialState: ActionState = {
  status: "idle",
};

function CommentSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="sm" className="rounded-full" disabled={pending}>
      {pending ? (
        <LoaderCircle className="size-4 animate-spin" />
      ) : (
        <MessageSquarePlus className="size-4" />
      )}
      {pending ? "등록 중" : "댓글 남기기"}
    </Button>
  );
}

export function CommentForm({ topicId, submissionId, enabled }: CommentFormProps) {
  const [state, formAction] = useActionState(createCommentAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3 rounded-[1.5rem] bg-slate-50 p-4 ring-1 ring-slate-200/70">
      <input type="hidden" name="topicId" value={topicId} />
      <input type="hidden" name="submissionId" value={submissionId} />

      {state.status !== "idle" ? (
        <Alert variant={state.status === "error" ? "destructive" : "default"}>
          {state.status === "success" ? (
            <CheckCircle2 className="size-4" />
          ) : (
            <TriangleAlert className="size-4" />
          )}
          <AlertTitle>
            {state.status === "success" ? "댓글 등록 완료" : "댓글을 확인해 주세요"}
          </AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-3 md:grid-cols-[10rem_1fr]">
        <div className="space-y-2">
          <Label htmlFor={`comment-grade-${submissionId}`}>학년 반</Label>
          <Input
            id={`comment-grade-${submissionId}`}
            name="commenterGradeClass"
            defaultValue="6학년 1반"
            disabled={!enabled}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`comment-name-${submissionId}`}>이름</Label>
          <Input
            id={`comment-name-${submissionId}`}
            name="commenterName"
            placeholder="예: 박서준"
            disabled={!enabled}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`comment-content-${submissionId}`}>댓글</Label>
        <Textarea
          id={`comment-content-${submissionId}`}
          name="content"
          className="min-h-24 resize-y"
          placeholder="공감되는 부분이나 질문하고 싶은 점을 남겨 보세요."
          disabled={!enabled}
        />
      </div>

      <div className="flex justify-end">
        <CommentSubmitButton />
      </div>
    </form>
  );
}
