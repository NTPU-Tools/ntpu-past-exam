"use client";

import instance from "@/api-client/instance";
import PDFViewer from "@/components/PDFViewer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { swrKeys } from "@/lib/swr-keys";
import userStore from "@/store/userStore";
import { formatRelative, subHours } from "date-fns";
import { zhTW } from "date-fns/locale";
import { isEmpty } from "lodash-es";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import useSWR, { mutate } from "swr";

interface PostDetailProps {
  postId: string;
  onBack?: () => void;
}

const PostDetail = ({ postId, onBack }: PostDetailProps) => {
  const { toast } = useToast();
  const { userData } = userStore();
  const isSuperUser = userData?.is_super_user;
  const [isDeleting, setIsDeleting] = useState(false);
  const isDeletingRef = useRef(false);

  const { data: adminScopes } = useSWR(
    !isEmpty(userData) ? swrKeys.adminDepartments() : null,
    () => instance.get("/users/me/departments-admin"),
  );

  const {
    data: post,
    isLoading,
    error,
  } = useSWR(postId ? swrKeys.post(postId) : null, () =>
    instance.get(`/posts/${postId}`),
  );

  const canDelete =
    isSuperUser ||
    adminScopes?.some((scope: any) => scope.id === post?.department_id);

  const handleDelete = useCallback(async () => {
    if (isDeletingRef.current) return;
    try {
      setIsDeleting(true);
      isDeletingRef.current = true;
      await instance.delete(`/posts/${postId}`);

      // 乐观更新 course 缓存，直接把被删除的考古题从列表移除
      if (post?.course_id) {
        mutate(
          swrKeys.course(post.course_id),
          (currentData: any) => {
            if (!currentData) return currentData;
            return {
              ...currentData,
              posts: currentData.posts?.filter((p: any) => p.id !== postId),
            };
          },
          { revalidate: false },
        );
      }

      // 清除 post 详情缓存，避免 404
      mutate(swrKeys.post(postId), undefined, { revalidate: false });

      toast({ title: "刪除成功" });
      onBack?.();
    } catch {
      toast({ title: "刪除失敗", variant: "error" });
    } finally {
      setIsDeleting(false);
      isDeletingRef.current = false;
    }
  }, [postId, post, onBack, toast]);

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
      <div className="flex items-start justify-between gap-2">
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
        {canDelete && (
          <div className="pb-3">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="刪除考古題"
                  className="h-9 w-9 text-destructive hover:text-destructive"
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>確定要刪除這份考古題嗎？</AlertDialogTitle>
                  <AlertDialogDescription>此操作無法復原。</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    刪除
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
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
      {post?.content && (
        <p className="mt-3 text-sm text-foreground whitespace-pre-wrap">
          {post.content}
        </p>
      )}
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
