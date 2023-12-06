import { TypographySmall } from "@/components/ui/typography";
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
          NTPU考古題<TypographySmall>Beta</TypographySmall>{" "}
          {isAdmin ? "- Admin" : ""}
        </span>
      </Link>
    </div>
  );
}
