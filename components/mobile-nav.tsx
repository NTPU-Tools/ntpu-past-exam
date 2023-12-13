import instance from "@/api/instance";
import { Button } from "@/components/ui/button";
import ScrollArea from "@/components/ui/scroll-area";
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
  const { data } = useSWR(open ? "all-courses" : null, () =>
    instance.get("/courses"),
  );

  const { pathname } = useRouter();
  const items = sortBy(groupBy(data, "category")).sort((a, b) =>
    a[0].category.localeCompare(b[0].category, "zh-Hant"),
  );
  const isAdminPage = pathname.includes("admin");

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
        <MobileLink
          href="/"
          className="flex items-center"
          onOpenChange={setOpen}
        >
          <span className="font-bold">
            NTPU 考古題 <TypographySmall>Beta</TypographySmall>{" "}
            {isAdminPage ? "- Admin" : ""}
          </span>
        </MobileLink>
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
                        href={`/course/${course.id}`}
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
