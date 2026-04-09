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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { cn, formatDate } from "@/lib/utils";
import userStore from "@/store/userStore";
import { isEmpty } from "lodash-es";
import { Heart, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { mutate } from "swr";

export interface Thread {
  id: string;
  title: string;
  content: string;
  owner_id: string;
  owner_name: string;
  is_owner: boolean;
  like_count: number;
  liked: boolean;
  is_anonymous: boolean;
  image_url?: string | null;
  create_time: string;
  updated_time: string;
  course_id: string;
}

interface ThreadCardProps {
  thread: Thread;
  courseId: string;
}

const ThreadCard = ({ thread, courseId }: ThreadCardProps) => {
  const params = useParams();
  const { toast } = useToast();
  const { userData } = userStore();
  const isLoggedIn = !isEmpty(userData);
  const isSuperUser = userData?.is_super_user;
  const [liked, setLiked] = useState(thread.liked ?? false);
  const [likeCount, setLikeCount] = useState(thread.like_count);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const displayName = thread.is_anonymous ? "匿名" : thread.owner_name;

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLiking) return;
    try {
      setIsLiking(true);
      const res = await instance.post<{ liked: boolean; thread: Thread }>(
        `/threads/${thread.id}/like`,
      );
      setLiked(res.liked);
      setLikeCount(res.thread.like_count);
      mutate(`threads-${courseId}`);
    } catch {
      toast({ title: "操作失敗", variant: "error" });
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isDeleting) return;
    try {
      setIsDeleting(true);
      await instance.delete(`/threads/${thread.id}`);
      mutate(`threads-${courseId}`);
      setDeleted(true);
    } catch {
      toast({ title: "刪除失敗", variant: "error" });
    } finally {
      setIsDeleting(false);
    }
  };

  const formattedDate = formatDate(thread.create_time);

  const href = `/${params?.department_id}/${courseId}/thread/${thread.id}`;

  if (deleted) return null;

  return (
    <Link href={href}>
    <Card
      className="hover:bg-muted transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="text-xs">
              {displayName.slice(0, 1)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-medium leading-none">
              {displayName}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {formattedDate}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {thread.is_anonymous && (
            <Badge variant="secondary" className="text-xs">
              匿名
            </Badge>
          )}
          {(thread.is_owner || isSuperUser) && (
            <div onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="刪除討論"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
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
            </div>
          )}
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-base leading-tight">
          {thread.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 whitespace-pre-wrap mt-1">
          {thread.content}
        </p>
      </div>
      <div className="flex items-center">
        {isLoggedIn && (
          <Button
            variant="ghost"
            size="sm"
            aria-label={liked ? "取消喜歡" : "喜歡"}
            className={cn(
              "gap-1.5 h-8 px-2",
              liked && "text-red-500 hover:text-red-600",
            )}
            onClick={handleLike}
            disabled={isLiking}
          >
            <Heart className={cn("h-4 w-4", liked && "fill-current")} />
            <span className="text-xs">{likeCount}</span>
          </Button>
        )}
        {!isLoggedIn && (
          <span className="flex items-center gap-1 h-8 px-2 text-xs text-muted-foreground">
            <Heart className="h-4 w-4" />
            {likeCount}
          </span>
        )}
      </div>
    </Card>
    </Link>
  );
};

export default ThreadCard;
