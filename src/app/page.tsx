import { redirect } from "next/navigation";

import { getFirstTopicId } from "@/lib/discussions";

export default function Home() {
  const firstTopicId = getFirstTopicId();

  if (!firstTopicId) {
    return null;
  }

  redirect(`/topics/${firstTopicId}`);
}
