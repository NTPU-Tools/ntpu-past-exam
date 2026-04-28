"use client";

import { useState, useCallback } from "react";
import instance from "@/api-client/instance";
import { PageHeader, PageHeaderHeading } from "@/components/PageHeader";
import ThreadList from "@/components/thread/ThreadList";
import ThreadDetail from "@/components/thread/ThreadDetail";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useDefaultLayout } from "react-resizable-panels";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryState } from "@/hooks/useQueryState";
import { swrKeys } from "@/lib/swr-keys";
import { times } from "lodash-es";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { useMediaQuery } from "usehooks-ts";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import PostDetail from "@/components/PostDetail";
import { cn } from "@/lib/utils";

interface Post {
  id: string;
  title: string;
}

interface CourseResponse {
  posts?: Post[];
  course?: { name: string };
}

interface DepartmentResponse {
  is_public?: boolean;
}

const PageLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col h-full">{children}</div>
);

function ExamListContent({
  courseData,
  departmentData,
  deptError,
  isDeptLoading,
  departmentId,
  courseId,
  setParams: setQueryParams,
  selectedPostId,
  onSelectPost,
}: {
  courseData: CourseResponse;
  departmentData?: DepartmentResponse;
  deptError?: Error;
  isDeptLoading: boolean;
  departmentId: string;
  courseId: string;
  setParams: (params: Record<string, string>) => void;
  selectedPostId?: string | null;
  onSelectPost?: (id: string) => void;
}) {
  const postCount = courseData.posts?.length ?? 0;

  if (courseData.posts && postCount > 0) {
    return (
      <div>
        {courseData.posts.map((post: Post) => (
          <button
            key={post.id}
            type="button"
            onClick={() => onSelectPost?.(post.id)}
            className={cn(
              "flex items-baseline justify-between py-3.5 border-b border-border text-sm font-medium hover:text-primary transition-colors group w-full text-left",
              selectedPostId === post.id && "text-primary"
            )}
          >
            <span>{post.title}</span>
            <span className="text-[11px] text-muted-foreground/20 group-hover:text-primary font-mono transition-colors shrink-0 ml-4">&rarr;</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <p className="text-sm border-l-[3px] border-primary/20 pl-4 py-2">
      {isDeptLoading ? (
        <Skeleton className="h-4 w-[200px]" />
      ) : deptError || departmentData?.is_public ? (
        <>
          <span className="text-muted-foreground">還沒有考古題。</span>{" "}
          <button
            type="button"
            className="text-primary font-semibold hover:underline underline-offset-2"
            onClick={() => setQueryParams({ open_create_post_dialog: "true" })}
          >
            上傳第一份 &rarr;
          </button>
        </>
      ) : (
        <span className="text-muted-foreground">尚無通過審核的考古題。</span>
      )}
    </p>
  );
}

function ExamPanelContent({
  selectedPostId,
  onSelectPost,
  onBack,
  courseData,
  departmentData,
  deptError,
  isDeptLoading,
  departmentId,
  courseId,
  setParams,
}: {
  selectedPostId: string | null;
  onSelectPost: (id: string) => void;
  onBack: () => void;
  courseData: CourseResponse;
  departmentData?: DepartmentResponse;
  deptError?: Error;
  isDeptLoading: boolean;
  departmentId: string;
  courseId: string;
  setParams: (params: Record<string, string>) => void;
}) {
  if (selectedPostId) {
    return <PostDetail postId={selectedPostId} onBack={onBack} />;
  }
  return (
    <ExamListContent
      courseData={courseData}
      departmentData={departmentData}
      deptError={deptError}
      isDeptLoading={isDeptLoading}
      departmentId={departmentId}
      courseId={courseId}
      setParams={setParams}
      selectedPostId={selectedPostId}
      onSelectPost={onSelectPost}
    />
  );
}

function ThreadPanelContent({
  selectedThreadId,
  onSelectThread,
  onBack,
  courseId,
}: {
  selectedThreadId: string | null;
  onSelectThread: (id: string) => void;
  onBack: () => void;
  courseId: string;
}) {
  if (!selectedThreadId) {
    return <ThreadList courseId={courseId} onSelectThread={onSelectThread} />;
  }
  return (
    <div>
      <div className="flex items-center gap-1 pb-3">
        <Button
          variant="ghost"
          size="icon"
          aria-label="返回討論列表"
          onClick={onBack}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>
      <ThreadDetail
        threadId={selectedThreadId}
        onDeleteSuccess={onBack}
      />
    </div>
  );
}

const CoursePage = () => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const params = useParams();
  const { setParams, get, removeParams } = useQueryState();
  const courseId = params.course_id as string | undefined;
  const departmentId = params.department_id as string | undefined;

  const courseFetcher = useCallback(
    () => instance.get(`/courses/${courseId}`),
    [courseId],
  );

  const departmentFetcher = useCallback(
    () => instance.get(`/departments/${departmentId}`),
    [departmentId],
  );

  const {
    data: courseData,
    isLoading,
    error,
  } = useSWR<CourseResponse>(
    courseId ? swrKeys.course(courseId) : null,
    courseFetcher,
  );

  const {
    data: departmentData,
    isLoading: isDeptLoading,
    error: deptError,
  } = useSWR<DepartmentResponse>(
    departmentId ? swrKeys.department(departmentId) : null,
    departmentFetcher,
  );

  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const selectedPostId = get("post");

  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: "course-page-split",
  });

  if (!courseId || !departmentId) {
    return (
      <PageLayout>
        <PageHeader>
          <PageHeaderHeading>找不到頁面</PageHeaderHeading>
        </PageHeader>
      </PageLayout>
    );
  }

  if (error?.response?.status === 404 || deptError?.response?.status === 404) {
    return (
      <PageLayout>
        <PageHeader>
          <PageHeaderHeading>找不到頁面</PageHeaderHeading>
        </PageHeader>
      </PageLayout>
    );
  }

  if (error || deptError) {
    return (
      <PageLayout>
        <PageHeader>
          <PageHeaderHeading>發生錯誤</PageHeaderHeading>
        </PageHeader>
      </PageLayout>
    );
  }

  if (isLoading || !courseData) {
    return (
      <PageLayout>
        <PageHeader>
          <Skeleton className="h-9 w-[160px]" />
        </PageHeader>
        <div className="space-y-px">
          {times(8).map((_, index) => (
            <Skeleton className="h-10 w-full" key={index} />
          ))}
        </div>
      </PageLayout>
    );
  }

  const postCount = courseData.posts?.length ?? 0;

  return (
    <div className="flex flex-col h-full" suppressHydrationWarning>
      <PageHeader className="shrink-0">
        <PageHeaderHeading>{courseData.course?.name}</PageHeaderHeading>
        {postCount > 0 && (
          <p className="text-xs text-muted-foreground pl-4 ml-[3px] mt-2 font-mono">{postCount} 份考古題</p>
        )}
      </PageHeader>

      {isDesktop ? (
        <ResizablePanelGroup
          orientation="horizontal"
          className="flex-1 min-h-0"
          defaultLayout={defaultLayout}
          onLayoutChanged={onLayoutChanged}
        >
          <ResizablePanel id="exam-list" order={1} defaultSize={55} minSize={30}>
            <ScrollArea className="h-full pr-4">
              <ExamPanelContent
                selectedPostId={selectedPostId}
                onSelectPost={(id) => setParams({ post: id })}
                onBack={() => removeParams("post")}
                courseData={courseData}
                departmentData={departmentData}
                deptError={deptError}
                isDeptLoading={isDeptLoading}
                departmentId={departmentId}
                courseId={courseId}
                setParams={setParams}
              />
            </ScrollArea>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel id="thread-panel" order={2} defaultSize={45} minSize={30}>
            <ScrollArea className="h-full pl-4">
              <ThreadPanelContent
                selectedThreadId={selectedThreadId}
                onSelectThread={setSelectedThreadId}
                onBack={() => setSelectedThreadId(null)}
                courseId={courseId}
              />
            </ScrollArea>
          </ResizablePanel>
        </ResizablePanelGroup>
      ) : (
        <div className="flex-1 min-h-0 overflow-auto space-y-8">
          <div>
            <ExamPanelContent
              selectedPostId={selectedPostId}
              onSelectPost={setSelectedPostId}
              onBack={() => setSelectedPostId(null)}
              courseData={courseData}
              departmentData={departmentData}
              deptError={deptError}
              isDeptLoading={isDeptLoading}
              departmentId={departmentId}
              courseId={courseId}
              setParams={setParams}
            />
          </div>
          <ThreadPanelContent
            selectedThreadId={selectedThreadId}
            onSelectThread={setSelectedThreadId}
            onBack={() => setSelectedThreadId(null)}
            courseId={courseId}
          />
        </div>
      )}
    </div>
  );
};

export default CoursePage;
