"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  isAdminAuthenticated,
  isAdminConfigured,
  loginAdmin,
  logoutAdmin,
} from "@/lib/admin-auth";
import { addHeart, createComment, createSubmission } from "@/lib/submissions";
import { createTopic } from "@/lib/topics";

export type ActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

const submissionSchema = z.object({
  topicId: z.string().trim().min(1),
  authorName: z
    .string()
    .trim()
    .min(1, "이름을 입력해 주세요.")
    .max(24, "이름은 24자 이하로 입력해 주세요."),
  gradeClass: z
    .string()
    .trim()
    .min(1, "학년 반을 입력해 주세요.")
    .max(32, "학년 반은 32자 이하로 입력해 주세요."),
  content: z
    .string()
    .trim()
    .min(10, "글은 최소 10자 이상 적어 주세요.")
    .max(1200, "글은 1200자 이하로 적어 주세요."),
});

const commentSchema = z.object({
  topicId: z.string().trim().min(1),
  submissionId: z.string().uuid(),
  commenterName: z
    .string()
    .trim()
    .min(1, "댓글 작성 이름을 입력해 주세요.")
    .max(24, "이름은 24자 이하로 입력해 주세요."),
  commenterGradeClass: z
    .string()
    .trim()
    .min(1, "학년 반을 입력해 주세요.")
    .max(32, "학년 반은 32자 이하로 입력해 주세요."),
  content: z
    .string()
    .trim()
    .min(2, "댓글은 최소 2자 이상 적어 주세요.")
    .max(300, "댓글은 300자 이하로 적어 주세요."),
});

const heartSchema = z.object({
  topicId: z.string().trim().min(1),
  submissionId: z.string().uuid(),
});

const topicSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "주제 제목은 2자 이상 입력해 주세요.")
    .max(80, "주제 제목은 80자 이하로 입력해 주세요."),
  category: z
    .string()
    .trim()
    .max(24, "카테고리는 24자 이하로 입력해 주세요.")
    .optional(),
  prompt: z
    .string()
    .trim()
    .min(10, "주제 설명은 10자 이상 입력해 주세요.")
    .max(400, "주제 설명은 400자 이하로 입력해 주세요."),
  guidingQuestion: z
    .string()
    .trim()
    .min(8, "생각을 여는 질문은 8자 이상 입력해 주세요.")
    .max(200, "질문은 200자 이하로 입력해 주세요."),
  tags: z
    .string()
    .trim()
    .max(120, "태그는 120자 이하로 입력해 주세요.")
    .optional(),
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
    gradeClass: formData.get("gradeClass"),
    content: formData.get("content"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "입력 내용을 다시 확인해 주세요.",
    };
  }

  const result = await createSubmission(parsed.data);

  if (!result.ok) {
    return {
      status: "error",
      message: result.message,
    };
  }

  revalidatePath("/");
  revalidatePath(`/write/${parsed.data.topicId}`);
  revalidatePath(`/topics/${parsed.data.topicId}`);
  revalidatePath("/admin");

  return {
    status: "success",
    message: result.message,
  };
}

export async function createCommentAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = commentSchema.safeParse({
    topicId: formData.get("topicId"),
    submissionId: formData.get("submissionId"),
    commenterName: formData.get("commenterName"),
    commenterGradeClass: formData.get("commenterGradeClass"),
    content: formData.get("content"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "댓글 내용을 다시 확인해 주세요.",
    };
  }

  const result = await createComment(parsed.data);

  if (!result.ok) {
    return {
      status: "error",
      message: result.message,
    };
  }

  revalidatePath(`/write/${parsed.data.topicId}`);
  revalidatePath("/admin");

  return {
    status: "success",
    message: result.message,
  };
}

export async function addHeartAction(formData: FormData) {
  const parsed = heartSchema.safeParse({
    topicId: formData.get("topicId"),
    submissionId: formData.get("submissionId"),
  });

  if (!parsed.success) {
    return;
  }

  await addHeart(parsed.data);

  revalidatePath(`/write/${parsed.data.topicId}`);
  revalidatePath("/admin");
}

export async function createTopicAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (!(await isAdminAuthenticated())) {
    return {
      status: "error",
      message: "교사 로그인 후에만 새 주제를 추가할 수 있습니다.",
    };
  }

  const parsed = topicSchema.safeParse({
    title: formData.get("title"),
    category: formData.get("category"),
    prompt: formData.get("prompt"),
    guidingQuestion: formData.get("guidingQuestion"),
    tags: formData.get("tags"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "주제 정보를 다시 확인해 주세요.",
    };
  }

  const result = await createTopic(parsed.data);

  if (!result.ok) {
    return {
      status: "error",
      message: result.message,
    };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/write/${result.topicId}`);

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
      message: parsed.error.issues[0]?.message ?? "비밀번호를 다시 확인해 주세요.",
    };
  }

  if (!isAdminConfigured()) {
    return {
      status: "error",
      message: "ADMIN_PASSWORD와 ADMIN_SECRET 환경변수를 먼저 설정해 주세요.",
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
