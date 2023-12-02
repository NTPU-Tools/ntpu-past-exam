import instance from "@/api/instance";
import PDFViewer from "@/components/PDFViewer";
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
  return (
    <div className="h-full flex flex-col">
      <TypographyH1>{post?.title}</TypographyH1>

      <TypographyP>{post?.content}</TypographyP>

      <PDFViewer src={post?.file} className="w-full h-96 basis-full" />
    </div>
  );
};

export default PostPage;
