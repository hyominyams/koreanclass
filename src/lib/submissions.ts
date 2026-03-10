import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  buildTopicSummary,
  flattenSeedResponses,
  getBoardMeta,
  getSeedResponses,
  type BoardComment,
  type ResponseItem,
  type TopicSummary,
} from "@/lib/discussions";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getTopicByIdFromSource,
  getTopicDefinitionsFromSource,
} from "@/lib/topics";

type SubmissionRow = {
  id: string;
  topic_id: string;
  author_name: string;
  grade_class: string | null;
  perspective: string;
  content: string;
  submitted_at: string;
};

type CommentRow = {
  id: string;
  submission_id: string;
  commenter_name: string;
  commenter_grade_class: string | null;
  content: string;
  created_at: string;
};

type HeartRow = {
  id: string;
  submission_id: string;
};

export type SubmissionInput = {
  topicId: string;
  authorName: string;
  gradeClass: string;
  content: string;
  perspective?: string;
};

export type CommentInput = {
  topicId: string;
  submissionId: string;
  commenterName: string;
  commenterGradeClass: string;
  content: string;
};

export type HeartInput = {
  topicId: string;
  submissionId: string;
};

export type SubmissionRecord = ResponseItem & {
  topicId: string;
};

export type SetupState = {
  supabaseConfigured: boolean;
  topicsReady: boolean;
  submissionsReady: boolean;
  interactionsReady: boolean;
  boardUpdatedAt: string;
};

function extractKeywords(content: string, perspective: string) {
  const tokens = `${perspective} ${content}`
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);

  return [...new Set(tokens)].slice(0, 5);
}

function mapCommentRow(row: CommentRow): BoardComment {
  return {
    id: row.id,
    submissionId: row.submission_id,
    author: row.commenter_name,
    gradeClass: row.commenter_grade_class?.trim() || "6학년 1반",
    content: row.content,
    createdAt: row.created_at,
  };
}

function buildSubmissionRecords(
  submissionRows: SubmissionRow[],
  commentRows: CommentRow[],
  heartRows: HeartRow[]
): SubmissionRecord[] {
  const commentsBySubmission = new Map<string, BoardComment[]>();
  const heartCountBySubmission = new Map<string, number>();

  commentRows.forEach((row) => {
    const comment = mapCommentRow(row);
    const list = commentsBySubmission.get(comment.submissionId) ?? [];
    list.push(comment);
    commentsBySubmission.set(comment.submissionId, list);
  });

  heartRows.forEach((row) => {
    heartCountBySubmission.set(
      row.submission_id,
      (heartCountBySubmission.get(row.submission_id) ?? 0) + 1
    );
  });

  return submissionRows.map((row) => {
    const comments =
      commentsBySubmission
        .get(row.id)
        ?.sort(
          (left, right) =>
            new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
        ) ?? [];

    return {
      id: row.id,
      topicId: row.topic_id,
      author: row.author_name,
      gradeClass: row.grade_class?.trim() || "6학년 1반",
      perspective: row.perspective,
      content: row.content,
      keywords: extractKeywords(row.content, row.perspective),
      submittedAt: row.submitted_at,
      heartCount: heartCountBySubmission.get(row.id) ?? 0,
      commentCount: comments.length,
      comments,
    };
  });
}

function getFallbackRecords() {
  return flattenSeedResponses().map((response) => ({
    ...response,
  }));
}

async function fetchInteractionRows(client: SupabaseClient | null, submissionIds: string[]) {
  if (!client || submissionIds.length === 0) {
    return {
      commentRows: [] as CommentRow[],
      heartRows: [] as HeartRow[],
    };
  }

  const [commentsResult, heartsResult] = await Promise.all([
    client
      .from("submission_comments")
      .select(
        "id, submission_id, commenter_name, commenter_grade_class, content, created_at"
      )
      .in("submission_id", submissionIds)
      .order("created_at", { ascending: true }),
    client.from("submission_hearts").select("id, submission_id").in("submission_id", submissionIds),
  ]);

  return {
    commentRows: commentsResult.error ? [] : (commentsResult.data satisfies CommentRow[]),
    heartRows: heartsResult.error ? [] : (heartsResult.data satisfies HeartRow[]),
  };
}

export async function getTopicResponses(topicId: string) {
  const topic = await getTopicByIdFromSource(topicId);

  if (!topic) {
    return [];
  }

  if (!isSupabaseConfigured()) {
    return getSeedResponses(topicId);
  }

  const client = await createSupabaseServerClient();

  if (!client) {
    return getSeedResponses(topicId);
  }

  const { data, error } = await client
    .from("submissions")
    .select("id, topic_id, author_name, grade_class, perspective, content, submitted_at")
    .eq("topic_id", topicId)
    .order("submitted_at", { ascending: false });

  if (error) {
    console.error("Failed to read submissions from Supabase.", error);
    return getSeedResponses(topicId);
  }

  const submissionRows = data satisfies SubmissionRow[];
  const submissionIds = submissionRows.map((row) => row.id);
  const { commentRows, heartRows } = await fetchInteractionRows(client, submissionIds);

  return buildSubmissionRecords(submissionRows, commentRows, heartRows).map((record) => ({
    id: record.id,
    author: record.author,
    gradeClass: record.gradeClass,
    perspective: record.perspective,
    content: record.content,
    keywords: record.keywords,
    submittedAt: record.submittedAt,
    heartCount: record.heartCount,
    commentCount: record.commentCount,
    comments: record.comments,
  }));
}

export async function getTopicSummariesFromSource(): Promise<TopicSummary[]> {
  const topics = await getTopicDefinitionsFromSource();

  if (!isSupabaseConfigured()) {
    return topics.map((topic) => buildTopicSummary(topic, topic.responses));
  }

  const client = await createSupabaseServerClient();

  if (!client) {
    return topics.map((topic) => buildTopicSummary(topic, topic.responses));
  }

  const { data, error } = await client
    .from("submissions")
    .select("id, topic_id, author_name, grade_class, perspective, content, submitted_at")
    .order("submitted_at", { ascending: false });

  if (error) {
    console.error("Failed to read topic summaries from Supabase.", error);
    return topics.map((topic) => buildTopicSummary(topic, topic.responses));
  }

  const groupedRows = new Map<string, SubmissionRecord[]>();
  const records = buildSubmissionRecords(data satisfies SubmissionRow[], [], []);

  records.forEach((record) => {
    const list = groupedRows.get(record.topicId) ?? [];
    list.push(record);
    groupedRows.set(record.topicId, list);
  });

  return topics.map((topic) =>
    buildTopicSummary(
      topic,
      (groupedRows.get(topic.id) ?? []).map((record) => ({
        id: record.id,
        author: record.author,
        gradeClass: record.gradeClass,
        perspective: record.perspective,
        content: record.content,
        keywords: record.keywords,
        submittedAt: record.submittedAt,
        heartCount: record.heartCount,
        commentCount: record.commentCount,
        comments: record.comments,
      }))
    )
  );
}

export async function getAdminSubmissions(filters?: {
  topicId?: string;
  date?: string;
}) {
  const fallbackRecords = getFallbackRecords();

  if (!isSupabaseConfigured()) {
    return applySubmissionFilters(fallbackRecords, filters);
  }

  const client = await createSupabaseServerClient();

  if (!client) {
    return applySubmissionFilters(fallbackRecords, filters);
  }

  let query = client
    .from("submissions")
    .select("id, topic_id, author_name, grade_class, perspective, content, submitted_at")
    .order("submitted_at", { ascending: false });

  if (filters?.topicId) {
    query = query.eq("topic_id", filters.topicId);
  }

  if (filters?.date) {
    query = query
      .gte("submitted_at", `${filters.date}T00:00:00+09:00`)
      .lt("submitted_at", `${filters.date}T23:59:59.999+09:00`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to read admin submissions from Supabase.", error);
    return applySubmissionFilters(fallbackRecords, filters);
  }

  const submissionRows = data satisfies SubmissionRow[];
  const submissionIds = submissionRows.map((row) => row.id);
  const { commentRows, heartRows } = await fetchInteractionRows(client, submissionIds);

  return buildSubmissionRecords(submissionRows, commentRows, heartRows);
}

function applySubmissionFilters(
  records: SubmissionRecord[],
  filters?: {
    topicId?: string;
    date?: string;
  }
) {
  return records.filter((record) => {
    if (filters?.topicId && record.topicId !== filters.topicId) {
      return false;
    }

    if (!filters?.date) {
      return true;
    }

    return record.submittedAt.startsWith(filters.date);
  });
}

export async function createSubmission(input: SubmissionInput) {
  const topic = await getTopicByIdFromSource(input.topicId);

  if (!topic) {
    return {
      ok: false,
      message: "선택한 주제를 찾을 수 없습니다.",
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      message: "Supabase 연결 정보가 없어 글을 저장할 수 없습니다.",
    };
  }

  const client = await createSupabaseServerClient();

  if (!client) {
    return {
      ok: false,
      message: "Supabase 클라이언트를 초기화하지 못했습니다.",
    };
  }

  const { error } = await client.from("submissions").insert({
    topic_id: input.topicId,
    author_name: input.authorName.trim(),
    grade_class: input.gradeClass.trim() || "6학년 1반",
    perspective: input.perspective?.trim() || "학생 의견",
    content: input.content.trim(),
  });

  if (error) {
    console.error("Failed to create a submission in Supabase.", error);

    if (error.code === "PGRST205") {
      return {
        ok: false,
        message: "submissions 테이블이 아직 준비되지 않았습니다. 관리자에게 migration 적용을 요청해 주세요.",
      };
    }

    return {
      ok: false,
      message: "글을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }

  return {
    ok: true,
    message: `${topic.title} 보드에 글을 올렸습니다.`,
  };
}

export async function createComment(input: CommentInput) {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      message: "Supabase 연결 정보가 없어 댓글을 저장할 수 없습니다.",
    };
  }

  const client = await createSupabaseServerClient();

  if (!client) {
    return {
      ok: false,
      message: "Supabase 클라이언트를 초기화하지 못했습니다.",
    };
  }

  const { error } = await client.from("submission_comments").insert({
    submission_id: input.submissionId,
    commenter_name: input.commenterName.trim(),
    commenter_grade_class: input.commenterGradeClass.trim() || "6학년 1반",
    content: input.content.trim(),
  });

  if (error) {
    console.error("Failed to create a comment in Supabase.", error);

    return {
      ok: false,
      message: "댓글을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }

  return {
    ok: true,
    message: "댓글이 등록되었습니다.",
  };
}

export async function addHeart(input: HeartInput) {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      message: "Supabase 연결 정보가 없어 하트를 저장할 수 없습니다.",
    };
  }

  const client = await createSupabaseServerClient();

  if (!client) {
    return {
      ok: false,
      message: "Supabase 클라이언트를 초기화하지 못했습니다.",
    };
  }

  const { error } = await client.from("submission_hearts").insert({
    submission_id: input.submissionId,
  });

  if (error) {
    console.error("Failed to create a heart in Supabase.", error);

    return {
      ok: false,
      message: "하트를 남기지 못했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }

  return {
    ok: true,
    message: "하트를 남겼습니다.",
  };
}

export async function getSetupState(): Promise<SetupState> {
  const supabaseConfigured = isSupabaseConfigured();

  if (!supabaseConfigured) {
    return {
      supabaseConfigured: false,
      topicsReady: false,
      submissionsReady: false,
      interactionsReady: false,
      boardUpdatedAt: getBoardMeta().updatedAt,
    };
  }

  const client = await createSupabaseServerClient();

  if (!client) {
    return {
      supabaseConfigured: false,
      topicsReady: false,
      submissionsReady: false,
      interactionsReady: false,
      boardUpdatedAt: getBoardMeta().updatedAt,
    };
  }

  const [topicsResult, submissionsResult, commentsResult, heartsResult] = await Promise.all([
    client.from("topics").select("id", { head: true, count: "exact" }),
    client.from("submissions").select("id", { head: true, count: "exact" }),
    client.from("submission_comments").select("id", { head: true, count: "exact" }),
    client.from("submission_hearts").select("id", { head: true, count: "exact" }),
  ]);

  return {
    supabaseConfigured: true,
    topicsReady: !topicsResult.error,
    submissionsReady: !submissionsResult.error,
    interactionsReady: !commentsResult.error && !heartsResult.error,
    boardUpdatedAt: getBoardMeta().updatedAt,
  };
}
