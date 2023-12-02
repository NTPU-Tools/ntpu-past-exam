import { cn } from "@/utils";
import Link from "next/link";

export function MainNav() {
  return (
    <div className="flex gap-6 md:gap-10">
      <Link href="/" className="flex items-center space-x-2">
        <span className="inline-block font-bold">NTPU 考古題</span>
      </Link>
      <nav className="flex gap-6">
        <Link
          href="/"
          className={cn(
            "flex items-center text-sm font-medium text-muted-foreground",
          )}
        >
          123
        </Link>
      </nav>
    </div>
  );
}
