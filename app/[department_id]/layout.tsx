import instance from "@/api-client/instance";
import type { Metadata } from "next";
import type { ReactNode } from "react";

type Props = { params: Promise<{ department_id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { department_id } = await params;
  try {
    const data = await instance.get<{ name?: string }>(
      `/departments/${department_id}`,
    );
    return { title: data.name };
  } catch {
    return {};
  }
}

export default function DepartmentLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
