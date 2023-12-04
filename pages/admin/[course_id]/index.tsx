import instance from "@/api/instance";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardHeader } from "@/components/ui/card";
import { TypographyH1 } from "@/components/ui/typography";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import useSWR from "swr";

const CoursePage = () => {
  const router = useRouter();
  const courseId = router.query.course_id as string | undefined;
  const { data: courseData } = useSWR(
    courseId ? `course-${courseId}` : null,
    () => instance.get(`/courses/${courseId}`),
  );

  const isAdmin = router.pathname.includes("admin");
  return (
    <div className="relative">
      <PageHeader>
        <TypographyH1>
          {isAdmin ? "Admin - " : ""}
          {courseData?.course.name}
        </TypographyH1>
      </PageHeader>
      <div className="grid grid-cols-1 gap-4 my-4">
        {courseData?.posts?.map((post: any) => (
          <Link href={`/admin/${courseId}/${post.id}`}>
            <Card key={post.id} className="hover:bg-muted">
              <CardHeader className="flex flex-row hover:underline">
                <ChevronRight />
                {post.title}
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CoursePage;
