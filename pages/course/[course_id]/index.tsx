import instance from "@/api/instance";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TypographyBlockquote, TypographyH1 } from "@/components/ui/typography";
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

  if (isLoading) {
    return (
      <div className="relative">
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

  if (error?.response?.status === 404) {
    return (
      <div className="min-h-[inherit] flex flex-col relative top-0 ">
        <PageHeader>
          <TypographyH1>找不到頁面</TypographyH1>
          <Head>
            <title>找不到頁面 - NPTU 考古題</title>
          </Head>
        </PageHeader>
      </div>
    );
  }

  return (
    <div className="relative">
      <PageHeader>
        <TypographyH1>{courseData?.course.name}</TypographyH1>
        <Head>
          <title>{courseData?.course.name} - NPTU 考古題</title>
        </Head>
      </PageHeader>
      <div className="grid grid-cols-1 gap-4 my-4">
        {courseData?.posts?.length ? (
          courseData?.posts?.map((post: any) => (
            <Link href={`/course/${courseId}/${post.id}`} key={post.id}>
              <Card className="hover:bg-muted">
                <CardHeader className="flex flex-row hover:underline">
                  <ChevronRight />
                  {post.title}
                </CardHeader>
              </Card>
            </Link>
          ))
        ) : (
          <TypographyBlockquote>尚無通過審核之考古題</TypographyBlockquote>
        )}
      </div>
    </div>
  );
};

export default CoursePage;
