"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { isAdminConfigured, loginAdmin, logoutAdmin } from "@/lib/admin-auth";
import { getTopicById } from "@/lib/discussions";
import { createSubmission } from "@/lib/submissions";

export type ActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

const submissionSchema = z.object({
  topicId: z.string().trim().min(1),
  authorName: z.string().trim().min(1, "이름 또는 닉네임을 입력해 주세요.").max(24),
  groupName: z.string().trim().max(24).optional(),
  perspective: z.string().trim().min(1, "관점을 한 줄로 적어 주세요.").max(32),
  content: z.string().trim().min(10, "생각은 최소 10자 이상 적어 주세요.").max(1200),
});

const loginSchema = z.object({
  password: z.string().min(1, "관리자 비밀번호를 입력해 주세요."),
});

export async function submitResponseAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = submissionSchema.safeParse({
    topicId: formData.get("topicId"),
    authorName: formData.get("authorName"),
    groupName: formData.get("groupName"),
    perspective: formData.get("perspective"),
    content: formData.get("content"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "입력값을 다시 확인해 주세요.",
    };
  }

  const topic = getTopicById(parsed.data.topicId);

  if (!topic) {
    return {
      status: "error",
      message: "선택한 주제를 찾을 수 없습니다.",
    };
  }

  const result = await createSubmission(parsed.data);

  if (!result.ok) {
    return {
      status: "error",
      message: result.message,
    };
  }

  revalidatePath(`/topics/${parsed.data.topicId}`);
  revalidatePath("/admin");

  return {
    status: "success",
    message: result.message,
  };
}

export async function loginAdminAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "비밀번호를 확인해 주세요.",
    };
  }

  if (!isAdminConfigured()) {
    return {
      status: "error",
      message: "ADMIN_PASSWORD와 ADMIN_SECRET 환경 변수를 먼저 설정해 주세요.",
    };
  }

  const isLoggedIn = await loginAdmin(parsed.data.password);

  if (!isLoggedIn) {
    return {
      status: "error",
      message: "관리자 비밀번호가 올바르지 않습니다.",
    };
  }

  redirect("/admin");
}

export async function logoutAdminAction() {
  await logoutAdmin();
  redirect("/admin/login");
}
