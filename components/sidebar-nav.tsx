import { Skeleton } from "@/components/ui/skeleton";
import useDepartmentCourse from "@/hooks/useDepartmentCourse";
import { cn } from "@/utils/cn";
import { head, map } from "lodash-es";
import Link from "next/link";
import { useRouter } from "next/router";

interface SidebarNavItem {
  title?: string;
  name?: string;
  href?: string;
  external?: boolean;
  label?: string;
  disabled?: boolean;
  items?: SidebarNavItem[];
}

export interface DocsSidebarNavProps {
  items: SidebarNavItem[];
}

interface DocsSidebarNavItemsProps {
  items: SidebarNavItem[];
  pathname: string | null;
}

export function SidebarNavItems({ items, pathname }: DocsSidebarNavItemsProps) {
  return items?.length ? (
    <div className="grid grid-flow-row auto-rows-max text-sm">
      {items.map((item, index) =>
        item.href && !item.disabled ? (
          <Link
            key={index}
            href={item.href}
            className={cn(
              "group flex w-full items-center rounded-md border border-transparent px-2 py-1 hover:underline",
              item.disabled && "cursor-not-allowed opacity-60",
              pathname?.includes(item.href)
                ? "font-medium text-foreground"
                : "text-muted-foreground",
            )}
            target={item.external ? "_blank" : ""}
            rel={item.external ? "noreferrer" : ""}
          >
            {item.title}
            {item.label && (
              <span className="ml-2 rounded-md bg-[#adfa1d] px-1.5 py-0.5 text-xs leading-none text-[#000000] no-underline group-hover:no-underline">
                {item.label}
              </span>
            )}
          </Link>
        ) : (
          <span
            key={index}
            className={cn(
              "flex w-full cursor-not-allowed items-center rounded-md p-2 text-muted-foreground hover:underline",
              item.disabled && "cursor-not-allowed opacity-60",
            )}
          >
            {item.title}
            {item.label && (
              <span className="ml-2 rounded-md bg-muted px-1.5 py-0.5 text-xs leading-none text-muted-foreground no-underline group-hover:no-underline">
                {item.label}
              </span>
            )}
          </span>
        ),
      )}
    </div>
  ) : null;
}

function SidebarNav() {
  const { pathname, asPath, query } = useRouter();

  const isAdminPage = pathname.includes("admin");

  const { data, isLoading } = useDepartmentCourse(
    query.department_id,
    !isAdminPage,
  );

  if (isLoading) {
    return (
      <div className="w-full flex-col flex gap-4">
        <Skeleton className="h-4 w-[150px]" />
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-4 w-[150px]" />
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-4 w-[80px]" />
        <Skeleton className="h-4 w-[120px]" />
        <Skeleton className="h-4 w-[150px]" />
        <Skeleton className="h-4 w-[60px]" />
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-4 w-[70px]" />
        <Skeleton className="h-4 w-[150px]" />
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-4 w-[150px]" />
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-4 w-[80px]" />
        <Skeleton className="h-4 w-[120px]" />
        <Skeleton className="h-4 w-[150px]" />
        <Skeleton className="h-4 w-[60px]" />
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-4 w-[70px]" />
      </div>
    );
  }
  if (isAdminPage) {
    return null;
  }

  return data?.length ? (
    <div className="w-full">
      {map(data, (courses) => (
        <div key={head(courses)?.category} className={cn("pb-4")}>
          <h4 className="mb-1 rounded-md px-2 py-1 text-sm font-semibold sticky top-0 bg-background">
            {head(courses)?.category}
          </h4>
          {courses?.length && (
            <SidebarNavItems
              items={map(
                courses.sort((a, b) => a.name.localeCompare(b.name, "zh-Hant")),
                (course) => ({
                  title: course.name,
                  href: `/${query.department_id}/${course.id}`,
                }),
              )}
              pathname={asPath}
            />
          )}
        </div>
      ))}
    </div>
  ) : null;
}

export default SidebarNav;
