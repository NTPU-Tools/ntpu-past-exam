import Link from "next/link";

export function MainNav() {
  return (
    <div className="flex gap-6 md:gap-10">
      <Link href="/" className="flex items-center space-x-2">
        <span className="hidden font-bold md:inline-block">NTPU 考古題</span>
      </Link>
    </div>
  );
}
