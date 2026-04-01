import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "找不到頁面" };

export default function NotFound() {
  return (
    <div className="min-h-[calc(100dvh-3rem)] flex flex-col items-center justify-center px-4">
      <p className="font-heading text-[80px] sm:text-[120px] font-black leading-none text-muted-foreground/10 select-none">404</p>
      <p className="text-sm text-muted-foreground -mt-4">這個頁面不存在。</p>
      <Link href="/" className="mt-6">
        <Button variant="outline" size="sm">回首頁</Button>
      </Link>
    </div>
  );
}
