import "server-only";

import {
  buildTopicSummary,
  flattenSeedResponses,
  getBoardMeta,
  getSeedResponses,
  getTopicById,
  getTopicDefinitions,
  type ResponseItem,
  type TopicSummary,
} from "@/lib/discussions";
import { createSupabaseAdminClient, isSupabaseConfigured } from "@/lib/supabase";

type SubmissionRow = {
  id: string;
  topic_id: string;
  author_name: string;
  group_name: string | null;
  perspective: string;
  content: string;
  submitted_at: string;
};

export type SubmissionInput = {
  topicId: string;
  authorName: string;
  groupName?: string;
  perspective: string;
  content: string;
};

export type SubmissionRecord = ResponseItem & {
  topicId: string;
};

function extractKeywords(content: string, perspective: string) {
  const tokens = `${perspective} ${content}`
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);

  return [...new Set(tokens)].slice(0, 4);
}

function mapRowToRecord(row: SubmissionRow): SubmissionRecord {
  return {
    id: row.id,
    topicId: row.topic_id,
    author: row.author_name,
    group: row.group_name ?? "자유 참여",
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
  if (!getTopicById(topicId)) {
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
    .select("id, topic_id, author_name, group_name, perspective, content, submitted_at")
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
      group: record.group,
      perspective: record.perspective,
      content: record.content,
      keywords: record.keywords,
      submittedAt: record.submittedAt,
    };
  });
}

export async function getTopicSummariesFromSource(): Promise<TopicSummary[]> {
  const topics = getTopicDefinitions();

  if (!isSupabaseConfigured()) {
    return topics.map((topic) => buildTopicSummary(topic, topic.responses));
  }

  const client = createSupabaseAdminClient();

  if (!client) {
    return topics.map((topic) => buildTopicSummary(topic, topic.responses));
  }

  const { data, error } = await client
    .from("submissions")
    .select("id, topic_id, author_name, group_name, perspective, content, submitted_at")
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
        group: record.group,
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
    .select("id, topic_id, author_name, group_name, perspective, content, submitted_at")
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
  const topic = getTopicById(input.topicId);

  if (!topic) {
    return {
      ok: false,
      message: "존재하지 않는 주제입니다.",
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      message: "Supabase 연결 정보가 아직 설정되지 않았습니다.",
    };
  }

  const client = createSupabaseAdminClient();

  if (!client) {
    return {
      ok: false,
      message: "Supabase 클라이언트를 초기화할 수 없습니다.",
    };
  }

  const { error } = await client.from("submissions").insert({
    topic_id: input.topicId,
    author_name: input.authorName,
    group_name: input.groupName?.trim() || null,
    perspective: input.perspective,
    content: input.content,
  });

  if (error) {
    console.error("Failed to create a submission in Supabase.", error);

    return {
      ok: false,
      message:
        "Supabase 저장에 실패했습니다. 테이블 생성과 환경 변수를 다시 확인해 주세요.",
    };
  }

  return {
    ok: true,
    message: `${topic.title} 주제에 의견이 저장됐습니다.`,
  };
}

export function getSetupState() {
  return {
    supabaseConfigured: isSupabaseConfigured(),
    boardUpdatedAt: getBoardMeta().updatedAt,
  };
}
