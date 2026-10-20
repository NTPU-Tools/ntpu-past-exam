import instance from "@/api-client/instance";
import type { Metadata } from "next";
import type { ReactNode } from "react";

type Props = { params: Promise<{ admin_department_id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { admin_department_id } = await params;
  try {
    const data = await instance.get<{ name?: string }>(
      `/departments/${admin_department_id}`,
    );
    return { title: `${data.name} Admin` };
  } catch {
    return {};
  }
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
