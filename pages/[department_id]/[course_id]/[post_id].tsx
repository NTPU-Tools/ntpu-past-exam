import instance from "@/api/instance";
import PDFViewer from "@/components/PDFViewer";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { TypographyP } from "@/components/ui/typography";
import { formatRelative, subHours } from "date-fns";
import { zhTW } from "date-fns/locale";
import { map } from "lodash-es";
import Head from "next/head";
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

  if (isLoading || !post) {
    return (
      <div>
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

  return (
    <div className="min-h-[inherit] flex flex-col relative top-0 ">
      <PageHeader>
        <PageHeaderHeading>{post?.title}</PageHeaderHeading>
        <Head>
          <title>{post?.title} - NPTU 考古題</title>
        </Head>
        <PageHeaderDescription>
          發布者： {post?.owner_name}
        </PageHeaderDescription>

        <PageHeaderDescription>
          發布時間：{" "}
          {formatRelative(
            new Date(
              subHours(new Date(post?.create_time), 8).toLocaleString("en-US", {
                timeZone: "Europe/London",
              }),
            ),
            new Date(),
            {
              locale: zhTW,
            },
          )}
        </PageHeaderDescription>
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
