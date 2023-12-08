import instance from "@/api/instance";
import PDFViewer from "@/components/PDFViewer";
import { PageHeader } from "@/components/PageHeader";
import { TypographyH1, TypographyP } from "@/components/ui/typography";
import { map } from "lodash-es";
import Head from "next/head";
import { useRouter } from "next/router";
import useSWR from "swr";

const PostPage = () => {
  const router = useRouter();
  const postId = router.query.post_id as string | undefined;
  const { data: post } = useSWR(postId ? `post-${postId}` : null, () =>
    instance.get(`/posts/${postId}`),
  );
  const isAdmin = router.pathname.includes("admin");
  return (
    <div className="min-h-[inherit] flex flex-col relative top-0 ">
      <PageHeader>
        <TypographyH1>
          {isAdmin ? "Admin - " : ""}
          {post?.title}
          <Head>
            <title>
              {isAdmin ? "Admin - " : ""}
              {post?.title} - NPTU 考古題
            </title>
          </Head>
        </TypographyH1>
      </PageHeader>

      <TypographyP>{post?.content}</TypographyP>

      {post?.files &&
        map(post?.files, (fileLink, index) => (
          <PDFViewer key={index} src={fileLink} className="w-full" />
        ))}
    </div>
  );
};

export default PostPage;
