"use client";

import instance from "@/api-client/instance";
import PDFViewer from "@/components/PDFViewer";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelative, subHours } from "date-fns";
import { zhTW } from "date-fns/locale";
import { swrKeys } from "@/lib/swr-keys";
import { map } from "lodash-es";
import { useParams } from "next/navigation";
import useSWR from "swr";

const PostPage = () => {
  const params = useParams();
  const postId = params.post_id as string | undefined;
  const {
    data: post,
    isLoading,
    error,
  } = useSWR(postId ? swrKeys.post(postId) : null, () =>
    instance.get(`/posts/${postId}`),
  );

  if (error?.response?.status === 404) {
    return (
      <div className="min-h-[inherit] flex flex-col relative top-0 ">
        <PageHeader>
          <PageHeaderHeading>找不到頁面</PageHeaderHeading>
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
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-2">
          <span>{post?.owner_name}</span>
          {!post?.is_migrate && (
            <>
            <span className="text-border">·</span>
            <span>
              {formatRelative(
                new Date(
                  subHours(new Date(post?.create_time), 8).toLocaleString(
                    "en-US",
                    {
                      timeZone: "Europe/London",
                    },
                  ),
                ),
                new Date(),
                {
                  locale: zhTW,
                },
              )}
            </span>
            </>
          )}
        </div>
      </PageHeader>
      {post?.files &&
        map(post?.files, (fileLink, index) => (
          <PDFViewer key={index} src={fileLink} className="w-full" />
        ))}
    </div>
  );
};

export default PostPage;
