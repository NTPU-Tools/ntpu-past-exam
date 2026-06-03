import instance from "@/api-client/instance";
import { Skeleton } from "@/components/ui/skeleton";
import useDepartmentCourse from "@/hooks/useDepartmentCourse";
import { cn } from "@/lib/utils";
import { swrKeys } from "@/lib/swr-keys";
import userStore from "@/store/userStore";
import { head, map } from "lodash-es";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import useSWR from "swr";

interface SidebarNavItem {
  title?: string;
  href?: string;
  external?: boolean;
  label?: string;
  disabled?: boolean;
}

interface SidebarNavItemsProps {
  items: SidebarNavItem[];
  pathname: string | null;
}

function SidebarNavItems({ items, pathname }: SidebarNavItemsProps) {
  return items?.length ? (
    <div className="space-y-1">
      {items.map((item, index) =>
        item.href && !item.disabled ? (
          <Link
            key={item.href || item.title || index} 
            href={item.href}
            className={cn(
              "group flex items-center gap-2 rounded-r-lg pl-3 pr-3 py-2 text-[14px] border-l-2 transition-[color,background-color,border-color,transform] duration-150 ease-[cubic-bezier(0.25,1,0.5,1)]",
              pathname === item.href || pathname?.startsWith(item.href + '/') 
                ? "border-primary bg-sidebar-accent text-sidebar-fg-active font-semibold"
                : "border-transparent text-sidebar-fg hover:bg-sidebar-accent hover:text-sidebar-fg-active hover:border-sidebar-border hover:translate-x-0.5",
            )}
            target={item.external ? "_blank" : ""}
            rel={item.external ? "noreferrer" : ""}
          >
            <span className="truncate">{item.title}</span>
            {item.label && (
              <span className="ml-auto text-[10px] font-bold text-primary opacity-0 -translate-x-2 transition-[opacity,transform] duration-150 group-hover:opacity-100 group-hover:translate-x-0">
                {item.label}
              </span>
            )}
          </Link>
        ) : (
          <span
            key={item.href || item.title || index} 
            className="flex items-center rounded-r-lg pl-3 pr-3 py-2 text-[14px] text-muted-foreground/30 border-l-2 border-transparent"
          >
            {item.title}
          </span>
        ),
      )}
    </div>
  ) : null;
}

function SidebarNav() {
  const pathname = usePathname();
  const params = useParams();
  const isAdminPage = pathname.includes("admin");
  const departmentId = params.department_id as string;
  const { userData } = userStore();

  const showEmptyCourses = userData?.show_empty_courses ?? true;

  const { data: departmentData } = useSWR(
    departmentId ? swrKeys.department(departmentId) : null,
    () => instance.get(`/departments/${departmentId}`),
  );

  const { data, isLoading } = useDepartmentCourse(
    departmentId,
    !isAdminPage,
  );

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="space-y-1 animate-fade-in">
          <Skeleton className="h-3 w-14 mb-2" />
          <Skeleton className="h-7 w-full" />
          <Skeleton className="h-7 w-4/5" />
          <Skeleton className="h-7 w-full" />
        </div>
        <div className="space-y-1 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <Skeleton className="h-3 w-18 mb-2" />
          <Skeleton className="h-7 w-full" />
          <Skeleton className="h-7 w-3/5" />
        </div>
      </div>
    );
  }

  if (isAdminPage) return null;

  return (
    <div className="rounded-r-2xl border border-sidebar-border/60 bg-sidebar/70 px-2 py-3">
      {departmentData && (
        <div className="mb-6 pl-3 pr-2 animate-fade-in-down">
          <Link
            href={`/${departmentId}`}
            className="font-heading font-black text-[15px] tracking-tight text-sidebar-fg-active hover:text-primary transition-colors duration-200"
          >
            {departmentData.name}
          </Link>
          <div className="w-9 h-[3px] bg-primary mt-2 rounded-full" />
        </div>
      )}
      {data?.length ? (
        <div className="space-y-6">
          {map(data, (courses) => {
            const filteredCourses = showEmptyCourses
              ? courses
              : courses.filter((c) => c.has_posts);
            if (!filteredCourses.length) return null;
            return (
              <div key={head(courses)?.category}>
                <h4 className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-sidebar-heading pl-3">
                  {head(courses)?.category}
                </h4>
                <SidebarNavItems
                  items={map(
                    [...filteredCourses].sort((a, b) => a.name.localeCompare(b.name, "zh-Hant")),
                    (course) => ({
                      title: course.name,
                      href: `/${departmentId}/${course.id}`,
                    }),
                  )}
                  pathname={pathname}
                />
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export default SidebarNav;
