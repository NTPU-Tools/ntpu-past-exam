import type { Metadata } from "next";
import type { ReactNode } from "react";

const API = process.env.API_ORIGIN || process.env.NEXT_PUBLIC_API_ORIGIN;

type Props = { params: Promise<{ department_id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { department_id } = await params;
  try {
    const res = await fetch(`${API}/departments/${department_id}`);
    if (!res.ok) return {};
    const data = await res.json();
    return { title: data.name };
  } catch {
    return {};
  }
}

export default function DepartmentLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
