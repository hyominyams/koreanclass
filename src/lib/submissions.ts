import "server-only";

import {
  buildTopicSummary,
  flattenSeedResponses,
  getBoardMeta,
  getSeedResponses,
  type ResponseItem,
  type TopicSummary,
} from "@/lib/discussions";
import { createSupabaseAdminClient, isSupabaseConfigured } from "@/lib/supabase";
import {
  getTopicByIdFromSource,
  getTopicDefinitionsFromSource,
} from "@/lib/topics";

type SubmissionRow = {
  id: string;
  topic_id: string;
  author_name: string;
  perspective: string;
  content: string;
  submitted_at: string;
};

export type SubmissionInput = {
  topicId: string;
  authorName: string;
  perspective: string;
  content: string;
};

export type SubmissionRecord = ResponseItem & {
  topicId: string;
};

export type SetupState = {
  supabaseConfigured: boolean;
  topicsReady: boolean;
  submissionsReady: boolean;
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

function mapRowToRecord(row: SubmissionRow): SubmissionRecord {
  return {
    id: row.id,
    topicId: row.topic_id,
    author: row.author_name,
    perspective: row.perspective,
    content: row.content,
    keywords: extractKeywords(row.content, row.perspective),
    submittedAt: row.submitted_at,
  };
}

function getFallbackRecords() {
  return flattenSeedResponses().map((response) => ({
    ...response,
  }));
}

export async function getTopicResponses(topicId: string) {
  const topic = await getTopicByIdFromSource(topicId);

  if (!topic) {
    return [];
  }

  if (!isSupabaseConfigured()) {
    return getSeedResponses(topicId);
  }

  const client = createSupabaseAdminClient();

  if (!client) {
    return getSeedResponses(topicId);
  }

  const { data, error } = await client
    .from("submissions")
    .select("id, topic_id, author_name, perspective, content, submitted_at")
    .eq("topic_id", topicId)
    .order("submitted_at", { ascending: false });

  if (error) {
    console.error("Failed to read submissions from Supabase.", error);
    return getSeedResponses(topicId);
  }

  return (data satisfies SubmissionRow[]).map((row) => {
    const record = mapRowToRecord(row);

    return {
      id: record.id,
      author: record.author,
      perspective: record.perspective,
      content: record.content,
      keywords: record.keywords,
      submittedAt: record.submittedAt,
    };
  });
}

export async function getTopicSummariesFromSource(): Promise<TopicSummary[]> {
  const topics = await getTopicDefinitionsFromSource();

  if (!isSupabaseConfigured()) {
    return topics.map((topic) => buildTopicSummary(topic, topic.responses));
  }

  const client = createSupabaseAdminClient();

  if (!client) {
    return topics.map((topic) => buildTopicSummary(topic, topic.responses));
  }

  const { data, error } = await client
    .from("submissions")
    .select("id, topic_id, author_name, perspective, content, submitted_at")
    .order("submitted_at", { ascending: false });

  if (error) {
    console.error("Failed to read topic summaries from Supabase.", error);
    return topics.map((topic) => buildTopicSummary(topic, topic.responses));
  }

  const groupedRows = new Map<string, SubmissionRecord[]>();

  (data satisfies SubmissionRow[]).forEach((row) => {
    const record = mapRowToRecord(row);
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
        perspective: record.perspective,
        content: record.content,
        keywords: record.keywords,
        submittedAt: record.submittedAt,
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

  const client = createSupabaseAdminClient();

  if (!client) {
    return applySubmissionFilters(fallbackRecords, filters);
  }

  let query = client
    .from("submissions")
    .select("id, topic_id, author_name, perspective, content, submitted_at")
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

  return (data satisfies SubmissionRow[]).map(mapRowToRecord);
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
      message: "Supabase 연결 정보가 없어 제출을 저장할 수 없습니다.",
    };
  }

  const client = createSupabaseAdminClient();

  if (!client) {
    return {
      ok: false,
      message: "Supabase 클라이언트를 초기화하지 못했습니다.",
    };
  }

  const { error } = await client.from("submissions").insert({
    topic_id: input.topicId,
    author_name: input.authorName.trim(),
    perspective: input.perspective.trim(),
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
      message: "응답을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }

  return {
    ok: true,
    message: `${topic.title} 주제에 생각을 제출했습니다.`,
  };
}

export async function getSetupState(): Promise<SetupState> {
  const supabaseConfigured = isSupabaseConfigured();

  if (!supabaseConfigured) {
    return {
      supabaseConfigured: false,
      topicsReady: false,
      submissionsReady: false,
      boardUpdatedAt: getBoardMeta().updatedAt,
    };
  }

  const client = createSupabaseAdminClient();

  if (!client) {
    return {
      supabaseConfigured: false,
      topicsReady: false,
      submissionsReady: false,
      boardUpdatedAt: getBoardMeta().updatedAt,
    };
  }

  const [topicsResult, submissionsResult] = await Promise.all([
    client.from("topics").select("id", { head: true, count: "exact" }),
    client.from("submissions").select("id", { head: true, count: "exact" }),
  ]);

  return {
    supabaseConfigured: true,
    topicsReady: !topicsResult.error,
    submissionsReady: !submissionsResult.error,
    boardUpdatedAt: getBoardMeta().updatedAt,
  };
}
