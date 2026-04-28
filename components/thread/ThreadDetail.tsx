"use client";

import instance from "@/api-client/instance";
import CommentItem, { ThreadComment } from "@/components/thread/CommentItem";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { TypographyBlockquote } from "@/components/ui/typography";
import { useToast } from "@/components/ui/use-toast";
import { createCommentSchema } from "@/schemas/thread";
import userStore from "@/store/userStore";
import { cn, formatDate, parseUTC } from "@/lib/utils";
import { swrKeys } from "@/lib/swr-keys";
import { zodResolver } from "@hookform/resolvers/zod";
import isEmpty from "lodash-es/isEmpty";
import { SendHorizontal, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import useSWR, { mutate } from "swr";
import * as z from "zod";

interface ThreadDetailData {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  is_owner: boolean;
  is_anonymous: boolean;
  owner_name?: string;
  create_time: string;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type SortMode = "all" | "asc" | "desc";

const SORT_TABS: { label: string; value: SortMode }[] = [
  { label: "全部留言", value: "all" },
  { label: "由舊至新", value: "asc" },
  { label: "由新至舊", value: "desc" },
];

interface ThreadDetailProps {
  threadId: string;
  onDeleteSuccess?: () => void;
}

const ThreadDetail = ({ threadId, onDeleteSuccess }: ThreadDetailProps) => {
  const params = useParams();
  const router = useRouter();
  const { userData } = userStore();
  const { toast } = useToast();
  const courseId = params.course_id as string | undefined;
  const departmentId = params.department_id as string | undefined;

  const [isDeleting, setIsDeleting] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("all");
  // [R1-6] isSubmitting drives UI disabled state; isSubmittingRef guards re-entrancy in closures
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  const validThreadId = threadId && UUID_RE.test(threadId) ? threadId : null;

  const {
    data: thread,
    isLoading: isLoadingThread,
    error,
  } = useSWR<ThreadDetailData>(validThreadId ? swrKeys.threadDetail(validThreadId) : null, () =>
    instance.get(`/threads/detail/${validThreadId}`),
  );

  const {
    data: comments,
    isLoading: isLoadingComments,
    mutate: mutateComments,
  } = useSWR<ThreadComment[]>(
    validThreadId ? swrKeys.threadComments(validThreadId) : null,
    () => instance.get(`/threads/${validThreadId}/comments`),
  );

  const form = useForm<z.infer<typeof createCommentSchema>>({
    resolver: zodResolver(createCommentSchema),
    defaultValues: { content: "", is_anonymous: false },
  });

  const sortedComments = useMemo(() => {
    if (!comments) return [];
    if (sortMode === "asc")
      return [...comments].sort(
        (a, b) =>
          parseUTC(a.create_time).getTime() - parseUTC(b.create_time).getTime(),
      );
    if (sortMode === "desc")
      return [...comments].sort(
        (a, b) =>
          parseUTC(b.create_time).getTime() - parseUTC(a.create_time).getTime(),
      );
    return [...comments]; // [R1-4] Defensive copy to protect SWR cache from mutation
  }, [comments, sortMode]);

  if (!validThreadId) {
    return <p>Invalid thread ID</p>;
  }

  const handleDelete = async () => {
    if (isDeleting) return;
    try {
      setIsDeleting(true);
      await instance.delete(`/threads/${validThreadId}`);
      toast({ title: "刪除成功" });
      if (courseId) {
        await mutate(swrKeys.threads(courseId)); // [R1-5] Await mutation before navigation
      }
      if (onDeleteSuccess) {
        onDeleteSuccess();
      } else if (departmentId && courseId) {
        router.replace(`/${departmentId}/${courseId}/thread`);
      }
    } catch {
      toast({ title: "刪除失敗", variant: "error" });
    } finally {
      setIsDeleting(false);
    }
  };

  const onSubmitComment = async (
    values: z.infer<typeof createCommentSchema>,
  ) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    try {
      await instance.post(`/threads/${validThreadId}/comments`, {
        content: values.content,
        is_anonymous: values.is_anonymous ?? false,
      });
      toast({ title: "留言成功" });
      form.reset();
      mutateComments();
    } catch {
      toast({ title: "留言失敗", variant: "error" });
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  if (error?.response?.status === 404) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">找不到這篇討論</p>
      </div>
    );
  }

  if (isLoadingThread || (!thread && !error)) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">載入失敗，請稍後再試</p>
      </div>
    );
  }

  const isOwner = thread.is_owner;

  const displayName = thread.is_anonymous ? "匿名" : thread.owner_name ?? "?";
  const threadInitials = displayName.slice(0, 1);
  const threadDate = formatDate(thread.create_time);

  return (
    <div className="flex flex-col">
      <Card className="shadow-sm">
        <CardContent className="pt-4 pb-4 px-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarFallback className="text-sm font-semibold">
                  {threadInitials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-none">
                  {displayName}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {threadDate}
                </p>
              </div>
            </div>

            {isOwner && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="刪除討論"
                    className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>確定要刪除這篇討論嗎？</AlertDialogTitle>
                    <AlertDialogDescription>此操作無法復原。</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                      刪除
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          <h1 className="text-base font-bold leading-snug">{thread.title}</h1>

          <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/80">
            {thread.content}
          </p>

          {thread.image_url && (
            <img
              src={thread.image_url}
              alt="討論圖片"
              className="w-full object-contain"
              referrerPolicy="no-referrer"
              loading="lazy" // [R1-3]
              decoding="async" // [R1-3]
            />
          )}
        </CardContent>
      </Card>

      <div className="flex gap-2 mt-5 mb-3">
        {SORT_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setSortMode(tab.value)}
            aria-pressed={sortMode === tab.value}
            className={cn(
              "px-3 py-1.5 text-sm font-medium border transition-colors",
              sortMode === tab.value
                ? "bg-foreground text-background border-foreground"
                : "bg-background text-muted-foreground border-border hover:border-foreground/40",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoadingComments ? (
        <div className="space-y-4 mt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 py-3">
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-[100px]" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : sortedComments.length ? (
        <div>
          {sortedComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              threadId={validThreadId}
            />
          ))}
        </div>
      ) : (
        <TypographyBlockquote>尚無留言，來留下第一則吧！</TypographyBlockquote>
      )}

      {!isEmpty(userData) ? (
        <div className="sticky bottom-0 z-40 bg-background border-t border-border px-4 py-3 flex items-center gap-3">
          <Textarea
            placeholder="輸入訊息..."
            className="flex-1 bg-muted min-h-0 h-10 resize-none py-2.5"
            {...form.register("content", { disabled: isSubmitting })} // [R2-2]
          />

          <Button
            variant="ghost"
            size="icon"
            aria-label="送出留言"
            className="shrink-0 text-muted-foreground"
            disabled={isSubmitting}
            onClick={form.handleSubmit(onSubmitComment, () => {
              const err = form.formState.errors.content?.message;
              toast({ title: err || "請輸入留言內容", variant: "error" }); // [R2-1]
            })}
          >
            <SendHorizontal className="h-5 w-5" />
          </Button>
        </div>
      ) : (
        <div className="sticky bottom-0 z-40 bg-background border-t border-border px-4 py-3 text-center text-sm text-muted-foreground">
          登入後才能留言
        </div>
      )}
    </div>
  );
};

export default ThreadDetail;
