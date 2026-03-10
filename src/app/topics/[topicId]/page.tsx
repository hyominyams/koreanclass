import { redirect } from "next/navigation";

type TopicPageProps = {
  params: Promise<{
    topicId: string;
  }>;
};

export default async function TopicPage({ params }: TopicPageProps) {
  const { topicId } = await params;
  redirect(`/write/${topicId}`);
}
