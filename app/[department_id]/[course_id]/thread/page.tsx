"use client";

import instance from "@/api-client/instance";
import { PageHeader, PageHeaderDescription, PageHeaderHeading } from "@/components/PageHeader";
import ThreadCard from "@/components/thread/ThreadCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TypographyBlockquote } from "@/components/ui/typography";
import { useQueryState } from "@/hooks/useQueryState";
import userStore from "@/store/userStore";
import { constant, times } from "lodash-es";
import { ArrowLeft, PenSquare } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import useSWR from "swr";

const ThreadListPage = () => {
  const params = useParams();
  const { userData } = userStore();
  const { setParams } = useQueryState();
  const courseId = params.course_id as string | undefined;
  const departmentId = params.department_id as string | undefined;

  const {
    data: threads,
    isLoading,
    error,
  } = useSWR(courseId ? `threads-${courseId}` : null, () =>
    instance.get(`/threads/${courseId}`),
  );

  const { data: courseData } = useSWR(
    courseId ? `course-${courseId}` : null,
    () => instance.get(`/courses/${courseId}`),
  );

  const courseName = courseData?.course?.name;

  if (error?.response?.status === 404) {
    return (
      <div className="min-h-[inherit] flex flex-col relative top-0">
        <PageHeader>
          <PageHeaderHeading>找不到頁面</PageHeaderHeading>
        </PageHeader>
      </div>
    );
  }

  if (isLoading || (!threads && !error)) {
    return (
      <div>
        <PageHeader>
          <Skeleton className="h-12 w-[200px]" />
        </PageHeader>
        <div className="grid grid-cols-1 gap-4 my-4">
          {times(5, constant(1)).map((_, index) => (
            <Skeleton className="h-[120px] w-full" key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[inherit] flex flex-col">
        <PageHeader>
          <PageHeaderHeading>載入失敗</PageHeaderHeading>
          <PageHeaderDescription>請稍後再試</PageHeaderDescription>
        </PageHeader>
      </div>
    );
  }

  return (
    <div className="relative">
      <PageHeader>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/${departmentId}/${courseId}`}>
              <ArrowLeft className="h-20 w-20" />
            </Link>
          </Button>
          <div>
            <PageHeaderHeading>討論區</PageHeaderHeading>
            {courseName && (
              <PageHeaderDescription>{courseName}</PageHeaderDescription>
            )}
          </div>
        </div>
      </PageHeader>

      <div className="flex justify-end mb-4">
        <Button
          onClick={() => setParams({ open_create_thread_dialog: "true" })}
          className="gap-2"
        >
          <PenSquare className="h-4 w-4" />
          新增討論
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {threads?.length ? (
          threads.map((thread: any) => (
            <ThreadCard
              key={thread.id}
              thread={thread}
              courseId={courseId!}
              currentUserId={userData?.id}
            />
          ))
        ) : (
          <TypographyBlockquote>尚無討論，來發第一篇吧！</TypographyBlockquote>
        )}
      </div>
    </div>
  );
};

export default ThreadListPage;
