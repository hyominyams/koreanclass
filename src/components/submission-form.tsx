"use client";

import { useActionState, useEffect, useRef } from "react";
import { LoaderCircle, SendHorizonal, TriangleAlert } from "lucide-react";
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
      {pending ? <LoaderCircle className="size-4 animate-spin" /> : <SendHorizonal className="size-4" />}
      {pending ? "저장 중..." : "생각 올리기"}
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
    <Card className="rounded-[2rem] border border-white/70 bg-background/88 py-0 shadow-sm backdrop-blur">
      <CardHeader className="border-b px-6 py-5">
        <CardTitle>생각 남기기</CardTitle>
        <CardDescription>
          로그인 없이도 이 주제에 바로 의견을 남길 수 있습니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 px-6 py-6">
        {!submissionsEnabled && (
          <Alert variant="destructive">
            <TriangleAlert className="size-4" />
            <AlertTitle>Supabase 설정 필요</AlertTitle>
            <AlertDescription>
              공개 작성은 Supabase 연결 후 활성화됩니다. 먼저 환경 변수와
              `supabase/schema.sql`을 적용해 주세요.
            </AlertDescription>
          </Alert>
        )}

        {state.status !== "idle" && (
          <Alert variant={state.status === "error" ? "destructive" : "default"}>
            <AlertTitle>
              {state.status === "success" ? "등록 완료" : "저장 실패"}
            </AlertTitle>
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}

        <form ref={formRef} action={formAction} className="space-y-5">
          <input type="hidden" name="topicId" value={topicId} />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`author-${topicId}`}>이름 또는 닉네임</Label>
              <Input
                id={`author-${topicId}`}
                name="authorName"
                placeholder="예: 김민준"
                disabled={!submissionsEnabled}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`group-${topicId}`}>모둠 또는 반</Label>
              <Input
                id={`group-${topicId}`}
                name="groupName"
                placeholder="예: 2모둠"
                disabled={!submissionsEnabled}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`perspective-${topicId}`}>내 관점 한 줄</Label>
            <Input
              id={`perspective-${topicId}`}
              name="perspective"
              placeholder={`예: ${topicTitle}에서 가장 중요한 건 공정성`}
              disabled={!submissionsEnabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`content-${topicId}`}>생각 내용</Label>
            <Textarea
              id={`content-${topicId}`}
              name="content"
              placeholder="근거나 예시까지 적어 주면 교사가 주제별로 모아보기 더 좋습니다."
              className="min-h-36"
              disabled={!submissionsEnabled}
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              입력한 글은 교사가 주제별, 날짜별로 모아볼 수 있습니다.
            </p>
            <SubmitButton />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
