import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100dvh-3rem)] flex flex-col items-center justify-center px-4">
      <title>找不到頁面 - NTPU 考古題</title>
      <p className="font-heading text-[80px] sm:text-[120px] font-black leading-none text-muted-foreground/10 select-none">404</p>
      <p className="text-sm text-muted-foreground -mt-4">這個頁面不存在。</p>
      <Link href="/" className="mt-6">
        <Button variant="outline" size="sm">回首頁</Button>
      </Link>
    </div>
  );
}
