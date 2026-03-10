"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  CheckCircle2,
  LoaderCircle,
  PencilLine,
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
        <PencilLine className="size-4" />
      )}
      {pending ? "게시 중" : "보드에 글 올리기"}
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
    <Card className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/92 py-0 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
      <CardHeader className="border-b border-slate-200/80 px-6 py-6">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-2">
            <CardTitle className="text-xl tracking-tight">새 글 쓰기</CardTitle>
            <CardDescription className="text-sm leading-6">
              <span className="font-medium text-slate-900">{topicTitle}</span> 주제에 대한
              생각을 보드에 바로 공유합니다.
            </CardDescription>
          </div>
          <div className="rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-xs font-medium text-sky-900">
            모두가 볼 수 있는 공유 글
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 px-6 py-6">
        {!submissionsEnabled && (
          <Alert variant="destructive">
            <TriangleAlert className="size-4" />
            <AlertTitle>게시판 저장이 아직 준비되지 않았습니다</AlertTitle>
            <AlertDescription>
              Supabase의 게시글 저장 테이블이 아직 연결되지 않았습니다. 관리자
              화면에서 데이터 설정 상태를 확인해 주세요.
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
              {state.status === "success" ? "게시 완료" : "입력 확인이 필요합니다"}
            </AlertTitle>
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}

        <form ref={formRef} action={formAction} className="space-y-5">
          <input type="hidden" name="topicId" value={topicId} />

          <div className="grid gap-5 md:grid-cols-[12rem_1fr]">
            <div className="space-y-2">
              <Label htmlFor={`grade-class-${topicId}`}>학년 반</Label>
              <Input
                id={`grade-class-${topicId}`}
                name="gradeClass"
                defaultValue="6학년 1반"
                disabled={!submissionsEnabled}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`author-${topicId}`}>이름</Label>
              <Input
                id={`author-${topicId}`}
                name="authorName"
                placeholder="예: 김민지"
                disabled={!submissionsEnabled}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`content-${topicId}`}>내 생각</Label>
            <Textarea
              id={`content-${topicId}`}
              name="content"
              className="min-h-44 resize-y"
              placeholder="내 의견, 이유, 예시, 친구들에게 묻고 싶은 질문까지 자유롭게 적어 보세요."
              disabled={!submissionsEnabled}
            />
          </div>

          <div className="flex flex-col gap-4 rounded-[1.5rem] bg-slate-50 px-5 py-4 ring-1 ring-slate-200/70 md:flex-row md:items-center md:justify-between">
            <p className="text-sm leading-6 text-slate-600">
              글을 올리면 아래 카드 보드에 바로 보이고, 다른 학생들도 댓글과 하트를
              남길 수 있습니다.
            </p>
            <SubmitButton />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
