"use client";

import instance from "@/api-client/instance";
import { PageHeader, PageHeaderHeading } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryState } from "@/hooks/useQueryState";
import { swrKeys } from "@/lib/swr-keys";
import { constant, times } from "lodash-es";
import { MessageSquare } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import useSWR from "swr";

const CoursePage = () => {
  const params = useParams();
  const { setParams } = useQueryState();
  const courseId = params.course_id as string | undefined;
  const departmentId = params.department_id as string | undefined;

  const {
    data: courseData,
    isLoading,
    error,
  } = useSWR(courseId ? swrKeys.course(courseId) : null, () =>
    instance.get(`/courses/${courseId}`),
  );

  const { data: departmentData } = useSWR(
    departmentId ? swrKeys.department(departmentId) : null,
    () => instance.get(`/departments/${departmentId}`),
  );

  if (error?.response?.status === 404) {
    return (
      <div>
        <PageHeader>
          <PageHeaderHeading>找不到頁面</PageHeaderHeading>
        </PageHeader>
      </div>
    );
  }

  if (isLoading || !courseData) {
    return (
      <div>
        <PageHeader>
          <Skeleton className="h-9 w-[160px]" />
        </PageHeader>
        <div className="space-y-px">
          {times(8, constant(1)).map((_, index) => (
            <Skeleton className="h-10 w-full" key={index} />
          ))}
        </div>
      </div>
    );
  }

  const postCount = courseData?.posts?.length ?? 0;

  return (
    <div>
      <PageHeader>
        <PageHeaderHeading>{courseData?.course?.name}</PageHeaderHeading>
        {postCount > 0 && (
          <p className="text-xs text-muted-foreground pl-4 ml-[3px] mt-2 font-mono">{postCount} 份考古題</p>
        )}
      </PageHeader>
      <div className="flex justify-end mb-2">
        <Button variant="outline" size="sm" className="gap-2" asChild>
          <Link href={`/${departmentId}/${courseId}/thread`}>
            <MessageSquare className="h-4 w-4" />
            前往討論區
          </Link>
        </Button>
      </div>
      {postCount > 0 ? (
        <div>
          {courseData.posts.map((post: any, idx: number) => (
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
          {departmentData?.is_public ? (
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
      )}
    </div>
  );
};

export default CoursePage;
