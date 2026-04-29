import instance from "@/api-client/instance";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { createCommentSchema } from "@/schemas/thread";
import { cn, formatDate } from "@/lib/utils";
import { swrKeys } from "@/lib/swr-keys";
import userStore from "@/store/userStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { isEmpty } from "lodash-es";
import { Checkbox } from "@/components/ui/checkbox";
import { CornerDownLeft, Heart, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import useSWR, { mutate } from "swr";
import * as z from "zod";

export interface ThreadComment {
  id: string;
  thread_id: string;
  parent_comment_id?: string | null;
  content: string;
  owner_id: string;
  owner_name: string;
  is_anonymous: boolean;
  is_owner: boolean;
  like_count: number;
  reply_count?: number;
  liked: boolean;
  create_time: string;
  updated_time: string;
}

export interface ThreadCommentDetail extends ThreadComment {
  replies?: ThreadCommentDetail[];
}


interface ReplyFormProps {
  threadId: string;
  parentCommentId: string;
  rootCommentId: string;
  replyToUserName?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const ReplyForm = ({
  threadId,
  parentCommentId,
  rootCommentId,
  replyToUserName,
  onSuccess,
  onCancel,
}: ReplyFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const isLoadingRef = useRef(false);

  const form = useForm<z.infer<typeof createCommentSchema>>({
    resolver: zodResolver(createCommentSchema),
    defaultValues: { content: "", is_anonymous: false },
  });

  const onSubmit = async (values: z.infer<typeof createCommentSchema>) => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.set("content", values.content);
      formData.set("is_anonymous", String(values.is_anonymous ?? false));
      formData.set("parent_comment_id", parentCommentId);

      await instance.postForm(`/threads/${threadId}/comments`, formData);
      toast({ title: "回覆成功" });
      form.reset();
      await mutate(swrKeys.threadComments(threadId));
      await mutate(swrKeys.comment(rootCommentId));
      onSuccess();
    } catch {
      toast({ title: "回覆失敗", variant: "error" });
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form className="mt-2 space-y-2">
        {replyToUserName && (
          <p className="text-xs text-muted-foreground">
            回覆 @{replyToUserName}
          </p>
        )}
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="輸入回覆..."
                  className="min-h-[72px] text-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
            <Checkbox
              checked={form.watch("is_anonymous")}
              onCheckedChange={(v) => form.setValue("is_anonymous", Boolean(v))}
            />
            匿名留言
          </label>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              onClick={form.handleSubmit(onSubmit)}
              disabled={isLoading}
            >
              送出
            </Button>
            <Button size="sm" variant="outline" onClick={onCancel} type="button">
              取消
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

const MAX_INDENT_DEPTH = 3;

interface ReplyItemProps {
  reply: ThreadCommentDetail;
  threadId: string;
  rootCommentId: string;
  depth?: number;
}

const ReplyItem = ({
  reply,
  threadId,
  rootCommentId,
  depth = 0,
}: ReplyItemProps) => {
  const { toast } = useToast();
  const { userData } = userStore();
  const isLoggedIn = !isEmpty(userData);
  const isSuperUser = userData?.is_super_user;
  const [liked, setLiked] = useState(reply.liked ?? false);
  const [likeCount, setLikeCount] = useState(reply.like_count);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const isOwner = reply.is_owner;

  const handleLike = async () => {
    if (isLiking) return;
    try {
      setIsLiking(true);
      const res = await instance.post<{
        liked: boolean;
        comment: ThreadComment;
      }>(`/threads/comments/${reply.id}/like`);
      setLiked(res.liked);
      setLikeCount(res.comment.like_count);
    } catch {
      toast({ title: "操作失敗", variant: "error" });
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    try {
      setIsDeleting(true);
      await instance.delete(`/threads/comments/${reply.id}`);
      await mutate(swrKeys.comment(rootCommentId));
      setDeleted(true);
      toast({ title: "刪除成功" });
    } catch {
      toast({ title: "刪除失敗", variant: "error" });
    } finally {
      setIsDeleting(false);
    }
  };

  if (deleted) return null;

  const displayName = reply.is_anonymous ? "匿名" : reply.owner_name;
  const initials = displayName.slice(0, 1);
  const date = formatDate(reply.create_time);

  return (
    <div className="py-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarFallback className="text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-semibold leading-none">
            {displayName}
          </span>
          <span className="text-xs text-muted-foreground">{date}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {isLoggedIn && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="回覆"
              className="h-7 w-7"
              onClick={() => setShowReplyForm((v) => !v)}
            >
              <CornerDownLeft className="h-3.5 w-3.5" />
            </Button>
          )}
          {isLoggedIn ? (
            <Button
              variant="ghost"
              size="icon"
              aria-label={liked ? "取消喜歡" : "喜歡"}
              className={cn(
                "h-7 w-7",
                liked && "text-red-500 hover:text-red-600",
              )}
              onClick={handleLike}
              disabled={isLiking}
            >
              <Heart className={cn("h-3.5 w-3.5", liked && "fill-current")} />
            </Button>
          ) : (
            <span className="h-7 w-7 flex items-center justify-center text-muted-foreground">
              <Heart className="h-3.5 w-3.5" />
            </span>
          )}
          {(isOwner || isSuperUser) && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="刪除回覆"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  disabled={isDeleting}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>確定要刪除這則回覆嗎？</AlertDialogTitle>
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
      </div>

      <p className="text-sm mt-1 ml-9 whitespace-pre-wrap text-foreground/80">
        {reply.content}
      </p>

      {showReplyForm && (
        <div className="ml-9 mt-2">
          <ReplyForm
            threadId={threadId}
            parentCommentId={reply.id}
            rootCommentId={rootCommentId}
            replyToUserName={reply.is_anonymous ? "匿名" : reply.owner_name}
            onSuccess={() => setShowReplyForm(false)}
            onCancel={() => setShowReplyForm(false)}
          />
        </div>
      )}

      {reply.replies && reply.replies.length > 0 && (
        <div className={depth < MAX_INDENT_DEPTH ? "ml-6 mt-1 border-l border-border pl-3" : "mt-1"}>
          {reply.replies.map((subReply) => (
            <ReplyItem
              key={subReply.id}
              reply={subReply}
              threadId={threadId}
              rootCommentId={rootCommentId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface CommentItemProps {
  comment: ThreadComment;
  threadId: string;
}

const CommentItem = ({
  comment,
  threadId,
}: CommentItemProps) => {
  const { toast } = useToast();
  const { userData } = userStore();
  const isLoggedIn = !isEmpty(userData);
  const isSuperUser = userData?.is_super_user;
  const [liked, setLiked] = useState(comment.liked ?? false);
  const [likeCount, setLikeCount] = useState(comment.like_count);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);

  const isOwner = comment.is_owner;

  const { data: commentDetail, isLoading: isLoadingReplies, mutate: mutateComment } =
    useSWR<ThreadCommentDetail>(
      showReplies ? swrKeys.comment(comment.id) : null,
      () => instance.get(`/threads/comments/${comment.id}`),
    );

  const handleLike = async () => {
    if (isLiking) return;
    try {
      setIsLiking(true);
      const res = await instance.post<{
        liked: boolean;
        comment: ThreadComment;
      }>(`/threads/comments/${comment.id}/like`);
      setLiked(res.liked);
      setLikeCount(res.comment.like_count);
      await mutate(swrKeys.threadComments(threadId));
    } catch {
      toast({ title: "操作失敗", variant: "error" });
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    try {
      setIsDeleting(true);
      await instance.delete(`/threads/comments/${comment.id}`);
      await mutate(swrKeys.threadComments(threadId));
      setDeleted(true);
      toast({ title: "刪除成功" });
    } catch {
      toast({ title: "刪除失敗", variant: "error" });
    } finally {
      setIsDeleting(false);
    }
  };

  const replies = commentDetail?.replies ?? [];
  const hasReplies = replies.length > 0;
  const showToggleButton =
    (comment.reply_count ?? 0) > 0 || hasReplies || showReplies;

  if (deleted) return null;

  const displayName = comment.is_anonymous ? "匿名" : comment.owner_name;
  const initials = displayName.slice(0, 1);
  const date = formatDate(comment.create_time);

  return (
    <div className="py-3 border-b border-border last:border-b-0">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-semibold leading-none">
            {displayName}
          </span>
          <span className="text-xs text-muted-foreground">{date}</span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {isLoggedIn && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="回覆"
              className="h-8 w-8"
              onClick={() => setShowReplyForm((v) => !v)}
            >
              <CornerDownLeft className="h-4 w-4" />
            </Button>
          )}
          {isLoggedIn ? (
            <Button
              variant="ghost"
              size="icon"
              aria-label={liked ? "取消喜歡" : "喜歡"}
              className={cn(
                "h-8 w-8",
                liked && "text-red-500 hover:text-red-600",
              )}
              onClick={handleLike}
              disabled={isLiking}
            >
              <Heart className={cn("h-4 w-4", liked && "fill-current")} />
            </Button>
          ) : (
            <span className="h-8 w-8 flex items-center justify-center text-muted-foreground">
              <Heart className="h-4 w-4" />
            </span>
          )}
          {(isOwner || isSuperUser) && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="刪除留言"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>確定要刪除這則留言嗎？</AlertDialogTitle>
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
      </div>

      <p className="text-sm mt-1.5 ml-10 whitespace-pre-wrap">
        {comment.content}
      </p>

      {showToggleButton && (
        <button
          type="button"
          className="text-xs text-muted-foreground ml-10 mt-1.5 hover:text-foreground transition-colors"
          onClick={() => setShowReplies((v) => !v)}
        >
          {showReplies ? "— 收起回覆" : "— 查看留言"}
        </button>
      )}

      {showReplyForm && (
        <div className="ml-10 mt-2">
          <ReplyForm
            threadId={threadId}
            parentCommentId={comment.id}
            rootCommentId={comment.id}
            replyToUserName={comment.is_anonymous ? "匿名" : comment.owner_name}
            onSuccess={() => {
              setShowReplyForm(false);
              setShowReplies(true);
            }}
            onCancel={() => setShowReplyForm(false)}
          />
        </div>
      )}

      {showReplies && (
        <div className="ml-6 mt-1 border-l border-border pl-3">
          {isLoadingReplies ? (
            <div className="space-y-2 py-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : (
            replies.map((reply) => (
              <ReplyItem
                key={reply.id}
                reply={reply}
                threadId={threadId}
                rootCommentId={comment.id}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CommentItem;
