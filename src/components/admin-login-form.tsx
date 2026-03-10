"use client";

import { useActionState } from "react";
import { KeyRound, LoaderCircle } from "lucide-react";
import { useFormStatus } from "react-dom";

import { type ActionState, loginAdminAction } from "@/app/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ActionState = {
  status: "idle",
};

function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" className="w-full rounded-full" disabled={pending}>
      {pending ? (
        <LoaderCircle className="size-4 animate-spin" />
      ) : (
        <KeyRound className="size-4" />
      )}
      {pending ? "확인 중" : "관리자 페이지 들어가기"}
    </Button>
  );
}

export function AdminLoginForm() {
  const [state, formAction] = useActionState(loginAdminAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {state.status === "error" ? (
        <Alert variant="destructive">
          <AlertTitle>로그인에 실패했습니다</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="admin-email">아이디</Label>
        <Input
          id="admin-email"
          name="email"
          type="email"
          autoComplete="username"
          placeholder="admin@example.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="admin-password">비밀번호</Label>
        <Input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="비밀번호를 입력하세요"
        />
      </div>

      <LoginButton />
    </form>
  );
}
