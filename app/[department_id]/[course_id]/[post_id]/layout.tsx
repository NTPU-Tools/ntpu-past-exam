import instance from "@/api-client/instance";
import type { Metadata } from "next";
import type { ReactNode } from "react";

type Props = { params: Promise<{ post_id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { post_id } = await params;
  try {
    const data = await instance.get<{ title?: string }>(`/posts/${post_id}`);
    return { title: data.title };
  } catch {
    return {};
  }
}

export default function PostLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
