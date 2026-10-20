import instance from "@/api-client/instance";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { TypographySmall } from "@/components/ui/typography";
import useDepartmentCourse from "@/hooks/useDepartmentCourse";
import { cn } from "@/lib/utils";
import { swrKeys } from "@/lib/swr-keys";
import userStore from "@/store/userStore";
import { ViewVerticalIcon } from "@radix-ui/react-icons";
import { map } from "lodash-es";
import Link, { LinkProps } from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import * as React from "react";
import useSWR from "swr";

interface MobileLinkProps extends LinkProps {
  // eslint-disable-next-line no-unused-vars
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

function MobileLink({
  href,
  onOpenChange,
  className,
  children,
  ...props
}: MobileLinkProps) {
  return (
    <Link
      href={href}
      onClick={() => {
        onOpenChange?.(false);
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </Link>
  );
}

export function MobileNav() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const { userData } = userStore();

  const showEmptyCourses = userData?.show_empty_courses ?? true;

  const isAdminPage = pathname.includes("admin");

  const { data } = useDepartmentCourse(
    params.department_id as string,
    !isAdminPage,
  );

  const { data: visibleDepartment } = useSWR(swrKeys.visibleDepartments(), () =>
    instance.get("/departments/visible"),
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <ViewVerticalIcon className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="px-0">
        <div className="flex flex-col gap-3 px-5 pt-6 pb-3">
          <MobileLink
            href="/"
            className="flex items-center gap-1"
            onOpenChange={setOpen}
          >
            <span className="font-heading font-black text-[15px] tracking-tight">
              NTPU 考古題
            </span>
            {process.env.NEXT_PUBLIC_GIT_BRANCH !== "main" && (
              <span className="text-[9px] text-destructive font-bold ml-1 uppercase tracking-wider">dev</span>
            )}
          </MobileLink>
          {params?.department_id && (
            <Select
              value={
                (params?.department_id as string | undefined) ?? undefined
              }
              onValueChange={(value) => {
                router.push(`/${value}`);
              }}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="請選擇社群" />
              </SelectTrigger>
              <SelectContent>
                {visibleDepartment?.length &&
                  visibleDepartment.map((department: any) => (
                    <SelectItem value={department.id} key={department.id}>
                      {department.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <ScrollArea className="h-[calc(100dvh-10rem)] px-5 pb-10">
          {isAdminPage ? null : (
            <div className="flex flex-col space-y-2">
              {map(data, (courses) => {
                const filteredCourses = showEmptyCourses
                  ? courses
                  : courses.filter((c) => c.has_posts);
                if (!filteredCourses.length) return null;
                return (
                  <div
                    key={courses[0].category}
                    className="flex flex-col space-y-3 pt-6"
                  >
                    <h4 className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-muted-foreground sticky top-0 z-10 bg-background py-1">
                      {courses[0].category}
                    </h4>
                    {map(
                      [...filteredCourses].sort((a, b) =>
                        a.name.localeCompare(b.name, "zh-Hant"),
                      ),
                      (course) => (
                        <React.Fragment key={course.id}>
                          <MobileLink
                            href={`/${params.department_id}/${course.id}`}
                            onOpenChange={setOpen}
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors py-0.5"
                          >
                            {course.name}
                          </MobileLink>
                        </React.Fragment>
                      ),
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
