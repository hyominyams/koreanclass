import rawBoardData from "@/content/discussions.json";

export type BoardMeta = {
  title: string;
  subtitle: string;
  className: string;
  facilitator: string;
  updatedAt: string;
};

export type ResponseItem = {
  id: string;
  author: string;
  group: string;
  perspective: string;
  content: string;
  keywords: string[];
  submittedAt: string;
};

export type TopicDefinition = {
  id: string;
  title: string;
  category: string;
  prompt: string;
  summary: string;
  guidingQuestion: string;
  tags: string[];
  responses: ResponseItem[];
};

export type TopicSummary = {
  id: string;
  title: string;
  category: string;
  prompt: string;
  responseCount: number;
  participantCount: number;
  latestResponseAt: string;
};

export type TopicMetrics = {
  responseCount: number;
  participantCount: number;
  keywordCount: number;
  latestResponseAt: string;
  topKeywords: string[];
  perspectives: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
};

type DiscussionBoard = {
  board: BoardMeta;
  topics: TopicDefinition[];
};

export type FlattenedSeedResponse = ResponseItem & {
  topicId: string;
};

const discussionBoard = rawBoardData as DiscussionBoard;

export function getBoardMeta() {
  return discussionBoard.board;
}

export function getTopicDefinitions() {
  return discussionBoard.topics;
}

export function getFirstTopicId() {
  return discussionBoard.topics[0]?.id ?? null;
}

export function getTopicById(topicId: string) {
  return discussionBoard.topics.find((topic) => topic.id === topicId) ?? null;
}

export function sortResponsesByNewest(responses: ResponseItem[]) {
  return [...responses].sort(
    (left, right) =>
      new Date(right.submittedAt).getTime() - new Date(left.submittedAt).getTime()
  );
}

export function getSeedResponses(topicId: string) {
  return sortResponsesByNewest(getTopicById(topicId)?.responses ?? []);
}

export function flattenSeedResponses(): FlattenedSeedResponse[] {
  return discussionBoard.topics.flatMap((topic) =>
    topic.responses.map((response) => ({
      ...response,
      topicId: topic.id,
    }))
  );
}

export function buildTopicSummary(
  topic: TopicDefinition,
  responses: ResponseItem[]
): TopicSummary {
  const sortedResponses = sortResponsesByNewest(responses);

  return {
    id: topic.id,
    title: topic.title,
    category: topic.category,
    prompt: topic.prompt,
    responseCount: sortedResponses.length,
    participantCount: new Set(sortedResponses.map((response) => response.author)).size,
    latestResponseAt: sortedResponses[0]?.submittedAt ?? discussionBoard.board.updatedAt,
  };
}

export function buildTopicMetrics(
  responses: ResponseItem[],
  fallbackDate = discussionBoard.board.updatedAt
): TopicMetrics {
  const keywordCounts = new Map<string, number>();
  const perspectiveCounts = new Map<string, number>();
  const sortedResponses = sortResponsesByNewest(responses);

  sortedResponses.forEach((response) => {
    response.keywords.forEach((keyword) => {
      keywordCounts.set(keyword, (keywordCounts.get(keyword) ?? 0) + 1);
    });

    perspectiveCounts.set(
      response.perspective,
      (perspectiveCounts.get(response.perspective) ?? 0) + 1
    );
  });

  const responseCount = sortedResponses.length;
  const participantCount = new Set(sortedResponses.map((response) => response.author)).size;

  return {
    responseCount,
    participantCount,
    keywordCount: keywordCounts.size,
    latestResponseAt: sortedResponses[0]?.submittedAt ?? fallbackDate,
    topKeywords: [...keywordCounts.entries()]
      .sort((left, right) => {
        if (right[1] === left[1]) {
          return left[0].localeCompare(right[0], "ko-KR");
        }

        return right[1] - left[1];
      })
      .slice(0, 6)
      .map(([keyword]) => keyword),
    perspectives: [...perspectiveCounts.entries()]
      .sort((left, right) => right[1] - left[1])
      .map(([name, count]) => ({
        name,
        count,
        percentage: responseCount === 0 ? 0 : Math.round((count / responseCount) * 100),
      })),
  };
}

export function formatKoreanDateTime(dateTime: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dateTime));
}

export function formatKoreanDate(dateTime: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateTime));
}
