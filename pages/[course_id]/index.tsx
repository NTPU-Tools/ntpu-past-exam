import instance from "@/api/instance";
import { TypographyH1 } from "@/components/ui/typography";
import Link from "next/link";
import { useRouter } from "next/router";
import useSWR from "swr";

const CoursePage = () => {
  const router = useRouter();
  const courseId = router.query.course_id as string | undefined;
  const { data: courseP } = useSWR(
    courseId ? `course-${courseId}-posts` : null,
    () => instance.get(`/posts?course_id=${courseId}`),
  );
  const { data: courseD } = useSWR(courseId ? `course-${courseId}` : null, () =>
    instance.get(`/courses/${courseId}`),
  );

  const courseData = courseD?.data;
  const coursePosts = courseP?.data;
  return (
    <div>
      <TypographyH1>{courseData?.name}</TypographyH1>
      {coursePosts?.map((post: any) => (
        <div key={post.id}>
          <Link href={`/${courseId}/${post.id}`}>{post.title}</Link>
        </div>
      ))}
    </div>
  );
};

export default CoursePage;
