import instance from "@/api/instance";
import PDFViewer from "@/components/PDFViewer";
import { PageHeader } from "@/components/PageHeader";
import { TypographyH1, TypographyP } from "@/components/ui/typography";
import { useRouter } from "next/router";
import useSWR from "swr";

const PostPage = () => {
  const router = useRouter();
  const postId = router.query.post_id as string | undefined;
  const { data } = useSWR(postId ? `post-${postId}` : null, () =>
    instance.get(`/posts/${postId}`),
  );
  const post = data?.data;
  const isAdmin = router.pathname.includes("admin");
  return (
    <div className="min-h-[inherit] flex flex-col relative top-0 ">
      <PageHeader>
        <TypographyH1>
          {isAdmin ? "Admin - " : ""}
          {post?.title}
        </TypographyH1>
      </PageHeader>

      <TypographyP>{post?.content}</TypographyP>

      <PDFViewer src={post?.file} className="w-full h-96 grow" />
    </div>
  );
};

export default PostPage;
