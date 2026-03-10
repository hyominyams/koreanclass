"use client";

import { useActionState, useEffect, useRef } from "react";
import { CheckCircle2, LoaderCircle, Plus, TriangleAlert } from "lucide-react";
import { useFormStatus } from "react-dom";

import { type ActionState, createTopicAction } from "@/app/actions";
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

const initialState: ActionState = {
  status: "idle",
};

function CreateTopicButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" className="rounded-full" disabled={pending}>
      {pending ? (
        <LoaderCircle className="size-4 animate-spin" />
      ) : (
        <Plus className="size-4" />
      )}
      {pending ? "추가 중" : "주제 추가"}
    </Button>
  );
}

export function TopicCreatorForm() {
  const [state, formAction] = useActionState(createTopicAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <Card className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 py-0 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
      <CardHeader className="border-b border-slate-200/80 px-6 py-6">
        <CardTitle className="text-xl tracking-tight">새 주제 추가</CardTitle>
        <CardDescription className="text-sm leading-6">
          주제는 교사 계정에서만 추가됩니다. 학생 화면에는 이 목록이 사이드바로
          바로 반영됩니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 px-6 py-6">
        {state.status !== "idle" && (
          <Alert variant={state.status === "error" ? "destructive" : "default"}>
            {state.status === "success" ? (
              <CheckCircle2 className="size-4" />
            ) : (
              <TriangleAlert className="size-4" />
            )}
            <AlertTitle>
              {state.status === "success" ? "주제 추가 완료" : "확인이 필요합니다"}
            </AlertTitle>
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}

        <form ref={formRef} action={formAction} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-[1.5fr_1fr]">
            <div className="space-y-2">
              <Label htmlFor="topic-title">주제 제목</Label>
              <Input
                id="topic-title"
                name="title"
                placeholder="예: 한국어 수업에서 토론이 더 필요한 이유"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="topic-category">카테고리</Label>
              <Input
                id="topic-category"
                name="category"
                placeholder="예: 토론, 글쓰기, 문화"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic-prompt">주제 설명</Label>
            <Textarea
              id="topic-prompt"
              name="prompt"
              className="min-h-28 resize-y"
              placeholder="학생이 이 주제에서 무엇을 생각하고 정리해야 하는지 또렷하게 적어 주세요."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic-guiding-question">생각을 여는 질문</Label>
            <Textarea
              id="topic-guiding-question"
              name="guidingQuestion"
              className="min-h-24 resize-y"
              placeholder="예: 이 상황에서 가장 먼저 바뀌어야 할 것은 무엇일까요?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic-tags">태그</Label>
            <Input
              id="topic-tags"
              name="tags"
              placeholder="예: 말하기, 협업, 피드백"
            />
            <p className="text-xs text-muted-foreground">
              쉼표로 구분하면 최대 8개까지 저장됩니다.
            </p>
          </div>

          <div className="flex justify-end">
            <CreateTopicButton />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
