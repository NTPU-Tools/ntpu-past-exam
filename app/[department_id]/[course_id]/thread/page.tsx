"use client";

import instance from "@/api-client/instance";
import { PageHeader, PageHeaderDescription, PageHeaderHeading } from "@/components/PageHeader";
import ThreadCard, { Thread } from "@/components/thread/ThreadCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TypographyBlockquote } from "@/components/ui/typography";
import { useQueryState } from "@/hooks/useQueryState";
import userStore from "@/store/userStore";
import { swrKeys } from "@/lib/swr-keys";
import { constant, isEmpty, times } from "lodash-es";
import { ArrowLeft, PenSquare } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";

const PAGE_SIZE = 20;

const ThreadListPage = () => {
  const params = useParams();
  const { userData } = userStore();
  const { setParams } = useQueryState();
  const courseId = params.course_id as string | undefined;
  const departmentId = params.department_id as string | undefined;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const {
    data: threadsData,
    isLoading,
    error,
  } = useSWR<{ threads: Thread[]; total: number }>(
    courseId ? swrKeys.threads(courseId) : null,
    () => instance.get(`/threads/${courseId}`),
  );

  const threads = threadsData?.threads;

  const { data: courseData } = useSWR(
    courseId ? swrKeys.course(courseId) : null,
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

  if (isLoading || (!threadsData && !error)) {
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
          <Button variant="ghost" size="icon" aria-label="返回課程頁面" asChild>
            <Link href={`/${departmentId}/${courseId}`}>
              <ArrowLeft className="h-5 w-5" />
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

      {!isEmpty(userData) && (
        <div className="flex justify-end mb-4">
          <Button
            onClick={() => setParams({ open_create_thread_dialog: "true" })}
            className="gap-2"
          >
            <PenSquare className="h-4 w-4" />
            新增討論
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {threads?.length ? (
          <>
            {threads.slice(0, visibleCount).map((thread: Thread) => (
              <ThreadCard
                key={thread.id}
                thread={thread}
                courseId={courseId!}
              />
            ))}
            {visibleCount < (threadsData?.total ?? 0) && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              >
                載入更多
              </Button>
            )}
          </>
        ) : (
          <TypographyBlockquote>尚無討論，來發第一篇吧！</TypographyBlockquote>
        )}
      </div>
    </div>
  );
};

export default ThreadListPage;
