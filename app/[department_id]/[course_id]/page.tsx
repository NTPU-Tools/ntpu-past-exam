"use client";

import { useState, useEffect } from "react";
import instance from "@/api-client/instance";
import { PageHeader, PageHeaderHeading } from "@/components/PageHeader";
import ThreadList from "@/components/thread/ThreadList";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryState } from "@/hooks/useQueryState";
import { swrKeys } from "@/lib/swr-keys";
import { times } from "lodash-es";
import { useParams } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { useMediaQuery } from "usehooks-ts";

interface Post {
  id: string;
  title: string;
}

const CoursePage = () => {
  const isDesktop = useMediaQuery("(min-width: 768px)", { defaultValue: true });
  const [mounted, setMounted] = useState(false); // [R2-3]
  useEffect(() => setMounted(true), []); // [R2-3]
  const showDesktop = !mounted ? true : isDesktop; // [R2-3]

  const params = useParams();
  const { setParams } = useQueryState();
  const courseId = params.course_id as string | undefined;
  const departmentId = params.department_id as string | undefined;

  const {
    data: courseData,
    isLoading,
    error,
  } = useSWR(
    courseId ? swrKeys.course(courseId) : null,
    () => instance.get(`/courses/${courseId}`),
  );

  const {
    data: departmentData,
    isLoading: isDeptLoading,
    error: deptError,
  } = useSWR(
    departmentId ? swrKeys.department(departmentId) : null,
    () => instance.get(`/departments/${departmentId}`),
  );

  if (!courseId || !departmentId) {
    return (
      <div className="flex flex-col h-full">
        <PageHeader>
          <PageHeaderHeading>找不到頁面</PageHeaderHeading>
        </PageHeader>
      </div>
    );
  }

  if (error?.response?.status === 404) {
    return (
      <div className="flex flex-col h-full"> {/* [R2-5] */}
        <PageHeader>
          <PageHeaderHeading>找不到頁面</PageHeaderHeading>
        </PageHeader>
      </div>
    );
  }

  if (error) { // [R1-1]
    return (
      <div className="flex flex-col h-full"> {/* [R2-5] */}
        <PageHeader>
          <PageHeaderHeading>發生錯誤</PageHeaderHeading>
        </PageHeader>
      </div>
    );
  }

  if (isLoading || !courseData) {
    return (
      <div className="flex flex-col h-full"> {/* [R2-5] */}
        <PageHeader>
          <Skeleton className="h-9 w-[160px]" />
        </PageHeader>
        <div className="space-y-px">
          {times(8).map((_, index) => ( // [R1-2]
            <Skeleton className="h-10 w-full" key={index} />
          ))}
        </div>
      </div>
    );
  }

  const postCount = courseData?.posts?.length ?? 0;

  const examListContent = courseData.posts && postCount > 0 ? ( // [R2-2]
    <div>
      {courseData.posts.map((post: Post) => ( // [R1-3]
        <Link
          href={`/${departmentId}/${courseId}/${post.id}`}
          key={post.id}
          className="flex items-baseline justify-between py-3.5 border-b border-border text-sm font-medium hover:text-primary transition-colors group"
        >
          <span>{post.title}</span>
          <span className="text-[11px] text-muted-foreground/20 group-hover:text-primary font-mono transition-colors shrink-0 ml-4">&rarr;</span>
        </Link>
      ))}
    </div>
  ) : (
    <p className="text-sm border-l-[3px] border-primary/20 pl-4 py-2">
      {isDeptLoading ? ( // [R1-4]
        <Skeleton className="h-4 w-[200px]" />
      ) : deptError || departmentData?.is_public ? ( // [R2-1]
        <>
          <span className="text-muted-foreground">還沒有考古題。</span>{" "}
          <button
            type="button"
            className="text-primary font-semibold hover:underline underline-offset-2"
            onClick={() => setParams({ open_create_post_dialog: "true" })}
          >
            上傳第一份 &rarr;
          </button>
        </>
      ) : (
        <span className="text-muted-foreground">尚無通過審核的考古題。</span>
      )}
    </p>
  );

  return (
    <div className="flex flex-col h-full">
      <PageHeader className="shrink-0">
        <PageHeaderHeading>{courseData?.course?.name}</PageHeaderHeading>
        {postCount > 0 && (
          <p className="text-xs text-muted-foreground pl-4 ml-[3px] mt-2 font-mono">{postCount} 份考古題</p>
        )}
      </PageHeader>

      {showDesktop ? ( // [R2-3]
        <ResizablePanelGroup
          orientation="horizontal"
          className="flex-1 min-h-0"
        >
          <ResizablePanel defaultSize={55} minSize={30}>
            <ScrollArea className="h-full pr-4">
              {examListContent}
            </ScrollArea>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={45} minSize={30}>
            <ScrollArea className="h-full pl-4">
              <ThreadList courseId={courseId} /> {/* [R2-4] */}
            </ScrollArea>
          </ResizablePanel>
        </ResizablePanelGroup>
      ) : (
        <div className="flex-1 min-h-0 overflow-auto space-y-8">
          <div>
            {examListContent}
          </div>
          <ThreadList courseId={courseId} /> {/* [R2-4] */}
        </div>
      )}
    </div>
  );
};

export default CoursePage;
