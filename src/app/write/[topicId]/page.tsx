import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type StudentWritePageProps = {
  params: Promise<{
    topicId: string;
  }>;
};

export default async function StudentWritePage({ params }: StudentWritePageProps) {
  const { topicId } = await params;
  redirect(`/topics/${topicId}`);
}
