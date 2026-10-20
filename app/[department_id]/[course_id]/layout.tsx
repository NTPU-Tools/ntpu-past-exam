import instance from "@/api-client/instance";
import type { Metadata } from "next";
import type { ReactNode } from "react";

type Props = { params: Promise<{ course_id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { course_id } = await params;
  try {
    const data = await instance.get<{ course?: { name?: string } }>(
      `/courses/${course_id}`,
    );
    return { title: data.course?.name };
  } catch {
    return {};
  }
}

export default function CourseLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
