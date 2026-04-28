"use client";

import instance from "@/api-client/instance";
import ThreadCard, { Thread } from "@/components/thread/ThreadCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TypographyBlockquote } from "@/components/ui/typography";
import { useQueryState } from "@/hooks/useQueryState";
import userStore from "@/store/userStore";
import { swrKeys } from "@/lib/swr-keys";
import { isEmpty, times } from "lodash-es";
import { PenSquare } from "lucide-react";
import { useEffect, useState } from "react";
import useSWR from "swr";

const PAGE_SIZE = 20;
const SKELETON_COUNT = 5; // [R2-3]

interface ThreadListProps {
  courseId: string;
  showHeader?: boolean;
} // [R1-2]

const ThreadList = ({ courseId, showHeader = true }: ThreadListProps) => { // [R1-2]
  const { userData } = userStore();
  const { setParams } = useQueryState();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => { // [R1-3]
    setVisibleCount(PAGE_SIZE); // [R1-3]
  }, [courseId]); // [R1-3]

  const {
    data: threadsData,
    isLoading,
    error,
  } = useSWR<{ threads: Thread[]; total: number }>(
    courseId ? swrKeys.threads(courseId) : null,
    (url: string) => instance.get(url),
  );

  const threads = threadsData?.threads;

  if (error) {
    return (
      <div className="p-4">
        <TypographyBlockquote>載入失敗，請稍後再試</TypographyBlockquote>
      </div>
    );
  }

  if (isLoading) { // [R2-1]
    return (
      <div>
        {showHeader && (
          <div className="mb-4">
            <Skeleton className="h-8 w-[120px]" />
          </div>
        )}
        <div className="grid grid-cols-1 gap-4">
          {times(SKELETON_COUNT).map((_, index) => ( // [R2-3]
            <Skeleton className="h-[120px] w-full" key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {showHeader && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-lg font-bold tracking-tight">討論區</h2>
          {!isEmpty(userData) && (
            <Button
              onClick={() => setParams({ open_create_thread_dialog: "true" })}
              size="sm"
              className="gap-2"
            >
              <PenSquare className="h-4 w-4" />
              新增討論
            </Button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {threads?.length ? (
          <>
            {threads.slice(0, visibleCount).map((thread: Thread) => (
              <ThreadCard
                key={thread.id}
                thread={thread}
                courseId={courseId}
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

export default ThreadList;
