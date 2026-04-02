import instance from "@/api-client/instance";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/utils/cn";
import { formatRelative } from "date-fns";
import { zhTW } from "date-fns/locale";
import { Heart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { mutate } from "swr";

interface Thread {
  id: string;
  title: string;
  content: string;
  owner_id: string;
  owner_name: string;
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
  currentUserId?: string;
}

const ThreadCard = ({ thread, courseId, currentUserId }: ThreadCardProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const [liked, setLiked] = useState(thread.liked ?? false);
  const [likeCount, setLikeCount] = useState(thread.like_count);
  const [isLiking, setIsLiking] = useState(false);

  const isOwner = !thread.is_anonymous && currentUserId && currentUserId === thread.owner_id;
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

  const formattedDate = (() => {
    try {
      const iso = thread.create_time;
      const s = /Z|[+-]\d{2}:\d{2}$/.test(iso) ? iso : iso + "Z";
      return formatRelative(new Date(s), new Date(), { locale: zhTW });
    } catch {
      return thread.create_time;
    }
  })();

  const href = `/${router.query.department_id}/${courseId}/thread/${thread.id}`;

  return (
    <Link href={href}>
      <Card className="hover:bg-muted transition-colors cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="text-xs">
                  {thread.owner_name.slice(0, 2)}
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
            {thread.is_anonymous && (
              <Badge variant="secondary" className="shrink-0 text-xs">
                匿名
              </Badge>
            )}
          </div>
          <h3 className="font-semibold text-base leading-tight mt-2">
            {thread.title}
          </h3>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground line-clamp-2 whitespace-pre-wrap">
            {thread.content}
          </p>
          <div className="flex items-center justify-between mt-3">
            <Button
              variant="ghost"
              size="sm"
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
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ThreadCard;
