import { notFound } from "next/navigation";

import { StudentBoardShell } from "@/components/student-board-shell";
import { getBoardMeta } from "@/lib/discussions";
import {
  getSetupState,
  getTopicResponses,
  getTopicSummariesFromSource,
} from "@/lib/submissions";
import { getTopicByIdFromSource } from "@/lib/topics";

export const dynamic = "force-dynamic";

type TopicPageProps = {
  params: Promise<{
    topicId: string;
  }>;
};

export default async function TopicPage({ params }: TopicPageProps) {
  const { topicId } = await params;
  const board = getBoardMeta();

  const [topic, topics, responses, setupState] = await Promise.all([
    getTopicByIdFromSource(topicId),
    getTopicSummariesFromSource(),
    getTopicResponses(topicId),
    getSetupState(),
  ]);

  if (!topic) {
    notFound();
  }

  const activeTopicSummary = topics.find((item) => item.id === topic.id);
  const participantCount = activeTopicSummary?.participantCount ?? 0;
  const latestActivity =
    activeTopicSummary?.latestResponseAt ?? setupState.boardUpdatedAt;

  return (
    <StudentBoardShell
      board={board}
      topic={topic}
      topics={topics}
      responses={responses}
      interactionsEnabled={setupState.interactionsReady}
      submissionsEnabled={setupState.submissionsReady}
      latestActivity={new Intl.DateTimeFormat("ko-KR", {
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(latestActivity))}
      participantCount={participantCount}
    />
  );
}
