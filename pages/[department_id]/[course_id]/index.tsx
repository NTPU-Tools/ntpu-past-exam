import instance from "@/api-client/instance";
import { PageHeader, PageHeaderHeading } from "@/components/PageHeader";
import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TypographyBlockquote } from "@/components/ui/typography";
import { constant, times } from "lodash-es";
import { ChevronRight } from "lucide-react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import useSWR from "swr";

const CoursePage = () => {
  const router = useRouter();
  const courseId = router.query.course_id as string | undefined;
  const {
    data: courseData,
    isLoading,
    error,
  } = useSWR(courseId ? `course-${courseId}` : null, () =>
    instance.get(`/courses/${courseId}`),
  );

  const { data: departmentData } = useSWR(
    router.query.department_id
      ? `department-${router.query.department_id}`
      : null,
    () => instance.get(`/departments/${router.query.department_id}`),
  );

  if (error?.response?.status === 404) {
    return (
      <div className="min-h-[inherit] flex flex-col relative top-0 ">
        <PageHeader>
          <PageHeaderHeading>找不到頁面</PageHeaderHeading>
          <Head>
            <title>找不到頁面 - NPTU 考古題</title>
          </Head>
        </PageHeader>
      </div>
    );
  }

  if (isLoading || !courseData) {
    return (
      <div>
        <PageHeader>
          <Skeleton className="h-12 w-[200px]" />
        </PageHeader>
        <div className="grid grid-cols-1 gap-4 my-4">
          {times(8, constant(1)).map((_, index) => (
            <Skeleton className="h-[72px] w-full" key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <PageHeader>
        <PageHeaderHeading>{courseData?.course?.name}</PageHeaderHeading>
        <Head>
          <title>{courseData?.course?.name} - NPTU 考古題</title>
        </Head>
      </PageHeader>
      <div className="grid grid-cols-1 gap-4 my-4">
        {courseData?.posts?.length ? (
          courseData?.posts?.map((post: any) => (
            <Link
              href={`/${router.query.department_id}/${courseId}/${post.id}`}
              key={post.id}
            >
              <Card className="hover:bg-muted">
                <CardHeader className="flex flex-row hover:underline">
                  <ChevronRight />
                  {post.title}
                </CardHeader>
              </Card>
            </Link>
          ))
        ) : (
          <TypographyBlockquote>
            {departmentData.is_public ? "尚無考古題" : "尚無通過審核之考古題"}
          </TypographyBlockquote>
        )}
      </div>
    </div>
  );
};

export default CoursePage;
