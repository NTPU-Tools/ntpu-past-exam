import instance from "@/api-client/instance";
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
import { cn } from "@/utils/cn";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatRelative } from "date-fns";
import { zhTW } from "date-fns/locale";
import { CornerDownLeft, Heart } from "lucide-react";
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
  like_count: number;
  reply_count: number;
  liked: boolean;
  create_time: string;
  updated_time: string;
}

export interface ThreadCommentDetail extends ThreadComment {
  replies?: ThreadCommentDetail[];
}

const AVATAR_COLORS = [
  "bg-blue-400",
  "bg-green-400",
  "bg-yellow-400",
  "bg-purple-400",
  "bg-pink-400",
  "bg-orange-400",
  "bg-teal-400",
  "bg-red-400",
];

function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function parseUTC(iso: string): Date {
  const s = /Z|[+-]\d{2}:\d{2}$/.test(iso) ? iso : iso + "Z";
  return new Date(s);
}

function formatDate(iso: string) {
  try {
    return formatRelative(parseUTC(iso), new Date(), {
      locale: zhTW,
    });
  } catch {
    return iso;
  }
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
      mutate(`thread-comments-${threadId}`);
      mutate(`comment-${rootCommentId}`);
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
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={form.handleSubmit(onSubmit)}
            isLoading={isLoading}
          >
            送出
          </Button>
          <Button size="sm" variant="outline" onClick={onCancel} type="button">
            取消
          </Button>
        </div>
      </form>
    </Form>
  );
};

interface ReplyItemProps {
  reply: ThreadCommentDetail;
  threadId: string;
  rootCommentId: string;
  currentUserId?: string;
}

const ReplyItem = ({
  reply,
  threadId,
  rootCommentId,
  currentUserId,
}: ReplyItemProps) => {
  const { toast } = useToast();
  const [liked, setLiked] = useState(reply.liked ?? false);
  const [likeCount, setLikeCount] = useState(reply.like_count);
  const [isLiking, setIsLiking] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);

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

  const displayName = reply.is_anonymous ? "匿名" : reply.owner_name;
  const color = avatarColor(displayName);
  const initials = displayName.slice(0, 1);
  const date = formatDate(reply.create_time);

  return (
    <div className="py-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Avatar className={cn("h-7 w-7 shrink-0", color)}>
            <AvatarFallback
              className={cn("text-xs text-white font-semibold", color)}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-semibold leading-none">
            {displayName}
          </span>
          <span className="text-xs text-muted-foreground">{date}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setShowReplyForm((v) => !v)}
          >
            <CornerDownLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-7 w-7",
              liked && "text-red-500 hover:text-red-600",
            )}
            onClick={handleLike}
            disabled={isLiking}
          >
            <Heart className={cn("h-3.5 w-3.5", liked && "fill-current")} />
          </Button>
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
        <div className="ml-6 mt-1 border-l border-border pl-3">
          {reply.replies.map((subReply) => (
            <ReplyItem
              key={subReply.id}
              reply={subReply}
              threadId={threadId}
              rootCommentId={rootCommentId}
              currentUserId={currentUserId}
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
  currentUserId?: string;
}

const CommentItem = ({
  comment,
  threadId,
  currentUserId,
}: CommentItemProps) => {
  const { toast } = useToast();
  const [liked, setLiked] = useState(comment.liked ?? false);
  const [likeCount, setLikeCount] = useState(comment.like_count);
  const [isLiking, setIsLiking] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);

  const { data: commentDetail, isLoading: isLoadingReplies } =
    useSWR<ThreadCommentDetail>(
      showReplies ? `comment-${comment.id}` : null,
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
      mutate(`thread-comments-${threadId}`);
    } catch {
      toast({ title: "操作失敗", variant: "error" });
    } finally {
      setIsLiking(false);
    }
  };

  const replies = commentDetail?.replies ?? [];
  const hasReplies = replies.length > 0;
  const showToggleButton =
    (comment.reply_count ?? 0) > 0 || hasReplies || showReplies;

  const displayName = comment.is_anonymous ? "匿名" : comment.owner_name;
  const color = avatarColor(displayName);
  const initials = displayName.slice(0, 1);
  const date = formatDate(comment.create_time);

  return (
    <div className="py-3 border-b border-border last:border-b-0">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Avatar className={cn("h-8 w-8 shrink-0", color)}>
            <AvatarFallback
              className={cn("text-sm text-white font-semibold", color)}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-semibold leading-none">
            {displayName}
          </span>
          <span className="text-xs text-muted-foreground">{date}</span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setShowReplyForm((v) => !v)}
          >
            <CornerDownLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8",
              liked && "text-red-500 hover:text-red-600",
            )}
            onClick={handleLike}
            disabled={isLiking}
          >
            <Heart className={cn("h-4 w-4", liked && "fill-current")} />
          </Button>
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
                currentUserId={currentUserId}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CommentItem;
