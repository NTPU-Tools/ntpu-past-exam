import Link from "next/link";
import { useRouter } from "next/router";

export function MainNav() {
  const { pathname } = useRouter();
  const isAdmin = pathname.includes("admin");

  return (
    <div className="flex gap-6 md:gap-10">
      <Link
        href={isAdmin ? "/admin" : "/"}
        className="flex items-center space-x-2"
      >
        <span className="hidden font-bold md:inline-block">
          NTPU 考古題 {isAdmin ? "- Admin" : ""}
        </span>
      </Link>
    </div>
  );
}
