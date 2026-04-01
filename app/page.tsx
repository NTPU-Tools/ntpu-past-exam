import type { Metadata } from "next";
import PageClient from "./page-client";

export const metadata: Metadata = { title: "選擇社群" };

export default function Page() {
  return <PageClient />;
}
