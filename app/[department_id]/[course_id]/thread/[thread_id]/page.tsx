"use client";

import ThreadDetail from "@/components/thread/ThreadDetail";
import { Button } from "@/components/ui/button";
import { PageHeader, PageHeaderHeading } from "@/components/PageHeader";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useCallback } from "react";

const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ThreadDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const threadId = Array.isArray(params.thread_id) ? params.thread_id[0] : params.thread_id;
  const courseId = Array.isArray(params.course_id) ? params.course_id[0] : params.course_id;
  const departmentId = Array.isArray(params.department_id) ? params.department_id[0] : params.department_id;

  const validThreadId = threadId && uuidRe.test(threadId) ? threadId : null;
  const validDepartmentId = departmentId || null; // [R2-2]
  const validCourseId = courseId || null; // [R2-2]

  const backHref = validDepartmentId && validCourseId ? `/${validDepartmentId}/${validCourseId}` : "/";
  const afterDeleteHref = validDepartmentId && validCourseId ? `/${validDepartmentId}/${validCourseId}/thread` : "/";

  const onDeleteSuccess = useCallback(() => {
    if (validDepartmentId && validCourseId) {
      router.replace(afterDeleteHref);
    }
  }, [validDepartmentId, validCourseId, router, afterDeleteHref]);

  if (!validThreadId) {
    return (
      <div className="min-h-[inherit] flex flex-col items-center justify-center p-8 max-w-3xl mx-auto">
        <PageHeader>
          <PageHeaderHeading>找不到這篇討論</PageHeaderHeading>
        </PageHeader>
        <Link
          href={backHref}
          className="mt-4 text-sm underline"
        >
          {validDepartmentId && validCourseId ? "返回討論列表" : "返回首頁"}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[inherit] flex flex-col max-w-3xl mx-auto">
      <div className="flex items-center gap-1 pt-2 pb-3 px-1">
        <Button variant="ghost" size="icon" aria-label="返回課程頁面" asChild>
          <Link href={backHref}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
      </div>

      <ThreadDetail
        threadId={validThreadId}
        onDeleteSuccess={onDeleteSuccess}
      />
    </div>
  );
};

export default ThreadDetailPage;
