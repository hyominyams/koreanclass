"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  CheckCircle2,
  LoaderCircle,
  SendHorizontal,
  TriangleAlert,
} from "lucide-react";
import { useFormStatus } from "react-dom";

import { type ActionState, submitResponseAction } from "@/app/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type SubmissionFormProps = {
  topicId: string;
  topicTitle: string;
  submissionsEnabled: boolean;
};

const initialState: ActionState = {
  status: "idle",
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" className="rounded-full" disabled={pending}>
      {pending ? (
        <LoaderCircle className="size-4 animate-spin" />
      ) : (
        <SendHorizontal className="size-4" />
      )}
      {pending ? "제출 중" : "생각 제출하기"}
    </Button>
  );
}

export function SubmissionForm({
  topicId,
  topicTitle,
  submissionsEnabled,
}: SubmissionFormProps) {
  const [state, formAction] = useActionState(submitResponseAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <Card className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 py-0 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
      <CardHeader className="border-b border-slate-200/80 px-6 py-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <CardTitle className="text-xl tracking-tight">생각 정리 작성</CardTitle>
            <CardDescription className="text-sm leading-6">
              <span className="font-medium text-foreground">{topicTitle}</span> 주제에
              대한 생각을 익명으로 정리해 제출합니다.
            </CardDescription>
          </div>
          <div className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-medium text-emerald-900">
            익명 제출
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 px-6 py-6">
        {!submissionsEnabled && (
          <Alert variant="destructive">
            <TriangleAlert className="size-4" />
            <AlertTitle>제출 테이블이 준비되지 않았습니다</AlertTitle>
            <AlertDescription>
              Supabase의 `submissions` 테이블이 아직 연결되지 않았습니다. 관리자
              페이지에서 설정 상태를 먼저 확인해 주세요.
            </AlertDescription>
          </Alert>
        )}

        {state.status !== "idle" && (
          <Alert variant={state.status === "error" ? "destructive" : "default"}>
            {state.status === "success" ? (
              <CheckCircle2 className="size-4" />
            ) : (
              <TriangleAlert className="size-4" />
            )}
            <AlertTitle>
              {state.status === "success" ? "제출 완료" : "확인이 필요합니다"}
            </AlertTitle>
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}

        <form ref={formRef} action={formAction} className="space-y-5">
          <input type="hidden" name="topicId" value={topicId} />

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`author-${topicId}`}>이름 또는 별칭</Label>
              <Input
                id={`author-${topicId}`}
                name="authorName"
                placeholder="예: 구름"
                disabled={!submissionsEnabled}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`perspective-${topicId}`}>어떤 관점에서 썼나요?</Label>
              <Input
                id={`perspective-${topicId}`}
                name="perspective"
                placeholder="예: 학생 입장에서, 친구 입장에서"
                disabled={!submissionsEnabled}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`content-${topicId}`}>생각 내용</Label>
            <Textarea
              id={`content-${topicId}`}
              name="content"
              placeholder="내 입장, 이유, 예시, 아직 남아 있는 질문까지 차분하게 적어 보세요."
              className="min-h-44 resize-y"
              disabled={!submissionsEnabled}
            />
          </div>

          <div className="flex flex-col gap-4 rounded-[1.5rem] bg-slate-50 px-5 py-4 ring-1 ring-slate-200/70 md:flex-row md:items-center md:justify-between">
            <p className="text-sm leading-6 text-slate-600">
              교사는 주제별로 응답을 모아 보지만, 학생 화면에는 다른 학생의 글이
              보이지 않습니다.
            </p>
            <SubmitButton />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
