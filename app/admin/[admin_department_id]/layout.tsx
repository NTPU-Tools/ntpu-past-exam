import type { Metadata } from "next";
import type { ReactNode } from "react";

const API = process.env.API_ORIGIN || process.env.NEXT_PUBLIC_API_ORIGIN;

type Props = { params: Promise<{ admin_department_id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { admin_department_id } = await params;
  try {
    const res = await fetch(`${API}/departments/${admin_department_id}`);
    if (!res.ok) return {};
    const data = await res.json();
    return { title: `${data.name} Admin` };
  } catch {
    return {};
  }
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
