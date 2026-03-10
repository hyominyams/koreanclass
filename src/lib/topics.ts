import "server-only";

import { isSupabaseConfigured } from "@/lib/supabase";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getFirstTopicId,
  getTopicById,
  getTopicDefinitions,
  type TopicDefinition,
} from "@/lib/discussions";

type TopicRow = {
  id: string;
  title: string;
  category: string;
  prompt: string;
  summary: string;
  guiding_question: string;
  tags: string[] | null;
  created_at: string;
};

export type TopicInput = {
  title: string;
  category?: string;
  prompt: string;
  guidingQuestion: string;
  tags?: string;
};

function mapTopicRow(row: TopicRow): TopicDefinition {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    prompt: row.prompt,
    summary: row.summary,
    guidingQuestion: row.guiding_question,
    tags: row.tags ?? [],
    responses: [],
  };
}

async function fetchTopicRows() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const client = await createSupabaseServerClient();

  if (!client) {
    return null;
  }

  const { data, error } = await client
    .from("topics")
    .select("id, title, category, prompt, summary, guiding_question, tags, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to read topics from Supabase.", error);
    return null;
  }

  return data satisfies TopicRow[];
}

export async function getTopicDefinitionsFromSource() {
  const rows = await fetchTopicRows();

  if (!rows || rows.length === 0) {
    return getTopicDefinitions();
  }

  return rows.map(mapTopicRow);
}

export async function getFirstTopicIdFromSource() {
  const rows = await fetchTopicRows();

  if (!rows || rows.length === 0) {
    return getFirstTopicId();
  }

  return rows[0]?.id ?? null;
}

export async function getTopicByIdFromSource(topicId: string) {
  const rows = await fetchTopicRows();

  if (!rows || rows.length === 0) {
    return getTopicById(topicId);
  }

  const row = rows.find((item) => item.id === topicId);
  return row ? mapTopicRow(row) : null;
}

function buildTopicId(title: string) {
  const normalized = title
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  const base = normalized.length > 0 ? normalized : "topic";
  return `${base}-${Date.now().toString(36)}`;
}

function parseTags(input?: string) {
  if (!input) {
    return [];
  }

  return [
    ...new Set(
      input
        .split(/[,\n]/)
        .map((tag) => tag.trim())
        .filter(Boolean)
    ),
  ].slice(0, 8);
}

export async function createTopic(input: TopicInput) {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      message: "Supabase 연결 정보가 없어 주제를 추가할 수 없습니다.",
    };
  }

  const client = await createSupabaseServerClient();

  if (!client) {
    return {
      ok: false,
      message: "Supabase 클라이언트를 초기화하지 못했습니다.",
    };
  }

  const title = input.title.trim();
  const prompt = input.prompt.trim();
  const guidingQuestion = input.guidingQuestion.trim();
  const category = input.category?.trim() || "일반";
  const tags = parseTags(input.tags);
  const id = buildTopicId(title);

  const { data, error } = await client
    .from("topics")
    .insert({
      id,
      title,
      category,
      prompt,
      summary: prompt.slice(0, 160),
      guiding_question: guidingQuestion,
      tags,
    })
    .select("id, title")
    .single();

  if (error) {
    console.error("Failed to create a topic in Supabase.", error);

    if (error.code === "PGRST205") {
      return {
        ok: false,
        message: "topics 테이블이 아직 준비되지 않았습니다. migration을 먼저 적용해 주세요.",
      };
    }

    return {
      ok: false,
      message: "주제를 추가하지 못했습니다. 입력값과 Supabase 설정을 다시 확인해 주세요.",
    };
  }

  return {
    ok: true,
    topicId: data.id,
    message: `${data.title} 주제가 추가되었습니다.`,
  };
}
