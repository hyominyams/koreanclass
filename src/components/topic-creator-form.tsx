"use client";

import { useActionState, useEffect, useRef } from "react";
import { CheckCircle2, LoaderCircle, Plus, Sparkles, TriangleAlert } from "lucide-react";
import { useFormStatus } from "react-dom";

import { type ActionState, createTopicAction } from "@/app/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState: ActionState = {
  status: "idle",
};

function CreateTopicButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" className="h-12 rounded-full px-6" disabled={pending}>
      {pending ? <LoaderCircle className="size-4 animate-spin" /> : <Plus className="size-4" />}
      {pending ? "추가 중" : "새 주제 추가하기"}
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
    <section className="overflow-hidden rounded-[32px] border border-[#dbe2ea] bg-white/86 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="grid xl:grid-cols-[minmax(0,1.15fr)_0.85fr]">
        <div className="px-6 py-7 sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#2a6f67]">
                Topic Studio
              </p>
              <h3 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                새 주제 추가하기
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                학생들이 바로 이해할 수 있는 제목과 설명, 생각을 여는 질문만 정리하면 충분합니다.
              </p>
            </div>
            <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-[#0f1728] text-white">
              <Sparkles className="size-5" />
            </span>
          </div>

          {state.status !== "idle" ? (
            <Alert
              variant={state.status === "error" ? "destructive" : "default"}
              className="mt-6 rounded-[24px]"
            >
              {state.status === "success" ? (
                <CheckCircle2 className="size-4" />
              ) : (
                <TriangleAlert className="size-4" />
              )}
              <AlertTitle>
                {state.status === "success" ? "주제가 추가되었습니다." : "입력값을 확인해 주세요."}
              </AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <form ref={formRef} action={formAction} className="mt-8 space-y-6">
            <div className="grid gap-5 md:grid-cols-[1.6fr_1fr]">
              <div className="space-y-2">
                <Label htmlFor="topic-title">주제 제목</Label>
                <Input id="topic-title" name="title" placeholder="예: 교실 환경 개선 아이디어" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="topic-category">카테고리</Label>
                <Input id="topic-category" name="category" placeholder="예: 학급 운영" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic-prompt">주제 설명</Label>
              <Textarea
                id="topic-prompt"
                name="prompt"
                className="min-h-32 resize-y"
                placeholder="학생들이 어떤 방향으로 생각을 나누면 좋을지 간결하게 적어 주세요."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic-guiding-question">생각을 여는 질문</Label>
              <Textarea
                id="topic-guiding-question"
                name="guidingQuestion"
                className="min-h-24 resize-y"
                placeholder="예: 우리가 먼저 바꾸고 싶은 공간은 어디일까요?"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic-tags">태그</Label>
              <Input id="topic-tags" name="tags" placeholder="예: 교실, 환경, 아이디어" />
              <p className="text-xs text-slate-500">쉼표로 구분하면 최대 8개까지 저장됩니다.</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">저장하면 학생용 왼쪽 사이드바에 바로 표시됩니다.</p>
              <CreateTopicButton />
            </div>
          </form>
        </div>

        <aside className="border-t border-[#e6ebf0] bg-[linear-gradient(180deg,#f6f8f9_0%,#eef4f3_100%)] px-6 py-7 sm:px-7 xl:border-t-0 xl:border-l">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#2a6f67]">
            Writing Guide
          </p>
          <h4 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
            교사 페이지에 맞춘 작성 흐름
          </h4>

          <div className="mt-6 space-y-4">
            {[
              "제목은 학생이 한 번에 이해할 수 있도록 짧고 선명하게 적습니다.",
              "설명에는 왜 이 주제를 여는지와 어떤 방향의 응답을 기대하는지 넣습니다.",
              "질문은 학생이 바로 답을 떠올릴 수 있게 구체적으로 적습니다.",
            ].map((item, index) => (
              <div
                key={item}
                className="flex gap-3 rounded-[22px] border border-white/70 bg-white/80 px-4 py-4"
              >
                <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-[#0f1728] text-xs font-semibold text-white">
                  {index + 1}
                </span>
                <p className="text-sm leading-6 text-slate-600">{item}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
