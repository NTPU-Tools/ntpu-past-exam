import type { Metadata } from "next";
import type { ReactNode } from "react";

const API = process.env.API_ORIGIN || process.env.NEXT_PUBLIC_API_ORIGIN;

type Props = { params: Promise<{ post_id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { post_id } = await params;
  try {
    const res = await fetch(`${API}/posts/${post_id}`);
    if (!res.ok) return {};
    const data = await res.json();
    return { title: data.title };
  } catch {
    return {};
  }
}

export default function PostLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
