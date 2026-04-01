import { Skeleton } from "@/components/ui/skeleton";
import useDepartmentCourse from "@/hooks/useDepartmentCourse";
import { cn } from "@/lib/utils";
import { head, map } from "lodash-es";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import useSWR from "swr";
import instance from "@/api-client/instance";

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
    <div className="space-y-px">
      {items.map((item, index) =>
        item.href && !item.disabled ? (
          <Link
            key={index}
            href={item.href}
            className={cn(
              "flex items-center gap-2 pl-3 pr-2 py-1.5 text-[13px] border-l-2 transition-colors",
              pathname?.includes(item.href)
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-sidebar-fg hover:text-foreground hover:border-border",
            )}
            target={item.external ? "_blank" : ""}
            rel={item.external ? "noreferrer" : ""}
          >
            {item.title}
            {item.label && (
              <span className="ml-auto text-[10px] font-bold text-primary">
                {item.label}
              </span>
            )}
          </Link>
        ) : (
          <span
            key={index}
            className="flex items-center pl-3 pr-2 py-1.5 text-[13px] text-muted-foreground/30 border-l-2 border-transparent"
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

  const { data: departmentData } = useSWR(
    departmentId ? `department-${departmentId}` : null,
    () => instance.get(`/departments/${departmentId}`),
  );

  const { data, isLoading } = useDepartmentCourse(
    departmentId,
    !isAdminPage,
  );

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="space-y-1">
          <Skeleton className="h-3 w-14 mb-2" />
          <Skeleton className="h-7 w-full" />
          <Skeleton className="h-7 w-4/5" />
          <Skeleton className="h-7 w-full" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-3 w-18 mb-2" />
          <Skeleton className="h-7 w-full" />
          <Skeleton className="h-7 w-3/5" />
        </div>
      </div>
    );
  }

  if (isAdminPage) return null;

  return (
    <div>
      {departmentData && (
        <div className="mb-5 pl-3">
          <p className="font-heading font-black text-sm tracking-tight">{departmentData.name}</p>
          <div className="w-7 h-[2px] bg-primary mt-1.5" />
        </div>
      )}
      {data?.length ? (
        <div className="space-y-5">
          {map(data, (courses) => (
            <div key={head(courses)?.category}>
              <h4 className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-sidebar-heading/50 pl-3">
                {head(courses)?.category}
              </h4>
              <SidebarNavItems
                items={map(
                  courses.sort((a, b) => a.name.localeCompare(b.name, "zh-Hant")),
                  (course) => ({
                    title: course.name,
                    href: `/${departmentId}/${course.id}`,
                  }),
                )}
                pathname={pathname}
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default SidebarNav;
