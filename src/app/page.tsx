import { redirect } from "next/navigation";

import { getFirstTopicIdFromSource } from "@/lib/topics";

export default async function Home() {
  const firstTopicId = await getFirstTopicIdFromSource();

  if (!firstTopicId) {
    return null;
  }

  redirect(`/write/${firstTopicId}`);
}
