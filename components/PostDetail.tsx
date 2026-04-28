"use client";

import instance from "@/api-client/instance";
import PDFViewer from "@/components/PDFViewer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelative, subHours } from "date-fns";
import { zhTW } from "date-fns/locale";
import { swrKeys } from "@/lib/swr-keys";
import { ArrowLeft } from "lucide-react";
import useSWR from "swr";

interface PostDetailProps {
  postId: string;
  onBack?: () => void;
}

const PostDetail = ({ postId, onBack }: PostDetailProps) => {
  const {
    data: post,
    isLoading,
    error,
  } = useSWR(postId ? swrKeys.post(postId) : null, () =>
    instance.get(`/posts/${postId}`),
  );

  if (error?.response?.status === 404) {
    return (
      <div className="p-4">
        <p className="text-muted-foreground">找不到這份考古題</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <p className="text-muted-foreground">載入失敗，請稍後再試</p>
      </div>
    );
  }

  if (isLoading || !post) {
    return (
      <div className="space-y-4 my-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="grid grid-cols-1 gap-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div>
      {onBack && (
        <div className="flex items-center gap-1 pb-3">
          <Button
            variant="ghost"
            size="icon"
            aria-label="返回考古題列表"
            onClick={onBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
      )}
      <h1 className="text-lg font-bold">{post?.title}</h1>
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
      <div className="mt-4">
        {post?.files &&
          post.files.map((fileLink: string) => (
            <PDFViewer key={fileLink} src={fileLink} className="w-full" />
          ))}
      </div>
    </div>
  );
};

export default PostDetail;
