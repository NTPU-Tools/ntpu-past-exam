import instance from "@/api/instance";
import { Button } from "@/components/ui/button";
import ScrollArea from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { TypographySmall } from "@/components/ui/typography";
import { cn } from "@/utils/cn";
import { ViewVerticalIcon } from "@radix-ui/react-icons";
import { groupBy, map, sortBy } from "lodash-es";
import Link, { LinkProps } from "next/link";
import { useRouter } from "next/router";
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
  const router = useRouter();
  return (
    <Link
      href={href}
      onClick={() => {
        router.push(href.toString());
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

  const isAdminPage = router.pathname.includes("admin");
  const { data } = useSWR(
    router.query.department_id && !isAdminPage
      ? `${router.query.department_id}-courses`
      : null,
    () => instance.get(`/departments/${router.query.department_id}/courses`),
  );

  const { data: visibleDepartment } = useSWR("visible-departments", () =>
    instance.get("/departments/visible"),
  );

  const items = sortBy(groupBy(data, "category")).sort((a, b) =>
    a[0].category.localeCompare(b[0].category, "zh-Hant"),
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
      <SheetContent side="left">
        <div className="flex flex-col gap-2">
          <MobileLink
            href="/"
            className="flex items-center"
            onOpenChange={setOpen}
          >
            <span className="font-bold">
              NTPU 考古題{" "}
              {process.env.NEXT_PUBLIC_ZEABUR_GIT_BRANCH !== "main" && (
                <TypographySmall>測試環境</TypographySmall>
              )}
            </span>
          </MobileLink>
          {router.query?.department_id && (
            <Select
              defaultValue={
                (router.query?.department_id as string | undefined) ?? undefined
              }
              onValueChange={(value) => {
                router.push(`/${value}`);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="請選擇社群" />
              </SelectTrigger>
              <SelectContent>
                {visibleDepartment?.length &&
                  visibleDepartment.map((department) => (
                    <SelectItem value={department.id} key={department.id}>
                      {department.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
          {isAdminPage ? null : (
            <div className="flex flex-col space-y-2">
              {map(items, (courses) => (
                <div
                  key={courses[0].category}
                  className="flex flex-col space-y-3 pt-6"
                >
                  <h4 className="font-medium">{courses[0].category}</h4>
                  {map(courses, (course) => (
                    <React.Fragment key={course.id}>
                      <MobileLink
                        href={`/${router.query.department_id}/${course.id}`}
                        onOpenChange={setOpen}
                        className="text-muted-foreground"
                      >
                        {course.name}
                      </MobileLink>
                    </React.Fragment>
                  ))}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
