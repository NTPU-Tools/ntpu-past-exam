import instance from "@/api/instance";
import PDFViewer from "@/components/PDFViewer";
import { PageHeader } from "@/components/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { TypographyH1, TypographyP } from "@/components/ui/typography";
import { useRouter } from "next/router";
import useSWR from "swr";

const PostPage = () => {
  const router = useRouter();
  const postId = router.query.post_id as string | undefined;
  const {
    data: post,
    isLoading,
    error,
  } = useSWR(postId ? `post-${postId}` : null, () =>
    instance.get(`/posts/${postId}`),
  );

  if (isLoading) {
    return (
      <div className="relative">
        <PageHeader>
          <Skeleton className="h-12 w-[200px]" />
        </PageHeader>
        <div className="grid grid-cols-1 gap-4 my-4">
          <Skeleton className="h-4 w-[280px] md:w-[500px]" />
          <Skeleton className="h-4 w-[180px] md:w-[300px]" />
          <Skeleton className="h-4 w-[80px] md:w-[570px]" />
          <Skeleton className="h-4 w-[80px] md:w-[180px]" />
          <Skeleton className="h-4 w-[200px] md:w-[500px]" />
          <Skeleton className="h-4 w-[80px] md:w-[300px]" />
          <Skeleton className="h-4 w-[80px] md:w-[570px]" />
          <Skeleton className="h-4 w-[200px] md:w-[880px]" />
          <Skeleton className="h-4 w-[100px] md:w-[500px]" />
          <Skeleton className="h-4 w-[80px] md:w-[300px]" />
          <Skeleton className="h-4 w-[200px] md:w-[770px]" />
          <Skeleton className="h-4 w-[180px] md:w-[580px]" />
          <Skeleton className="h-4 w-[80px] md:w-[500px]" />
          <Skeleton className="h-4 w-[80px] md:w-[300px]" />
          <Skeleton className="h-4 w-[280px] md:w-[570px]" />
          <Skeleton className="h-4 w-[80px] md:w-[880px]" />
          <Skeleton className="h-4 w-[100px] md:w-[500px]" />
          <Skeleton className="h-4 w-[80px] md:w-[300px]" />
        </div>
      </div>
    );
  }

  if (error?.response?.status === 404) {
    return (
      <div className="min-h-[inherit] flex flex-col relative top-0 ">
        <PageHeader>
          <TypographyH1>找不到考古題</TypographyH1>
        </PageHeader>
      </div>
    );
  }

  return (
    <div className="min-h-[inherit] flex flex-col relative top-0 ">
      <PageHeader>
        <TypographyH1>{post?.title}</TypographyH1>
      </PageHeader>
      <TypographyP>{post?.content}</TypographyP>

      {post?.file && (
        <PDFViewer src={post?.file} className="w-full h-96 grow" />
      )}
    </div>
  );
};

export default PostPage;
