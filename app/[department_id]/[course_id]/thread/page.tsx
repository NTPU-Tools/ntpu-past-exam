"use client";

import instance from "@/api-client/instance";
import { PageHeader, PageHeaderDescription, PageHeaderHeading } from "@/components/PageHeader";
import ThreadList from "@/components/thread/ThreadList";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { swrKeys } from "@/lib/swr-keys";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import useSWR from "swr";

const ThreadListPage = () => {
  const params = useParams();
  const courseId = params.course_id as string | undefined;
  const departmentId = params.department_id as string | undefined;

  const { data: courseData, error, isLoading } = useSWR(
    courseId ? swrKeys.course(courseId) : null,
    () => instance.get(`/courses/${courseId}`),
  );

  const courseName = courseData?.course?.name;

  if (error?.response?.status === 404) {
    return (
      <div className="min-h-[inherit] flex flex-col relative top-0 max-w-3xl mx-auto">
        <PageHeader>
          <PageHeaderHeading>找不到頁面</PageHeaderHeading>
        </PageHeader>
      </div>
    );
  }

  if (isLoading || (!courseData && !error)) {
    return (
      <div className="max-w-3xl mx-auto">
        <PageHeader>
          <Skeleton className="h-12 w-[200px]" />
        </PageHeader>
        <ThreadList courseId={courseId!} showHeader={true} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[inherit] flex flex-col max-w-3xl mx-auto">
        <PageHeader>
          <PageHeaderHeading>載入失敗</PageHeaderHeading>
          <PageHeaderDescription>請稍後再試</PageHeaderDescription>
        </PageHeader>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
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

      <ThreadList courseId={courseId!} showHeader={true} />
    </div>
  );
};

export default ThreadListPage;
