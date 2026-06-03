"use client";

import instance from "@/api-client/instance";
import { AutoLinkText } from "@/components/AutoLinkText";
import { PageHeader, PageHeaderHeading } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { TypographyP } from "@/components/ui/typography";
import { useQueryState } from "@/hooks/useQueryState";
import { swrKeys } from "@/lib/swr-keys";
import { times } from "lodash-es";
import { useParams } from "next/navigation";
import useSWR from "swr";

interface Bulletin {
  id: string;
  title: string;
  content: string;
}

function Page() {
  const params = useParams();
  const departmentId = params.department_id as string;
  const { get, setParams, removeParams } = useQueryState();

  const { data, isLoading, error } = useSWR<Bulletin[]>(
    swrKeys.departmentBulletins(departmentId),
    () => instance.get(`/departments/${departmentId}/bulletins`),
  );

  const bulletinDetailId = get("bulletin_detail_dialog");
  const dialogOpen = !!bulletinDetailId && !!data; 

  const { data: bulletinDetail, isLoading: isDetailLoading } = useSWR<Bulletin>(
    dialogOpen ? swrKeys.bulletin(bulletinDetailId) : null,
    () => instance.get(`/bulletins/${bulletinDetailId}`),
  );

  if (error) {
    return (
      <div className="max-w-3xl mx-auto">
        <PageHeader>
          <PageHeaderHeading>公告</PageHeaderHeading>
        </PageHeader>
        <p className="text-sm text-destructive">無法載入公告，請稍後再試。</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <PageHeader>
          <Skeleton className="h-9 w-[140px]" />
        </PageHeader>
        <div className="space-y-px">
          
          {times(4).map((_, index) => (
            <Skeleton className="h-16 w-full" key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-3xl mx-auto">
        <PageHeader>
          <PageHeaderHeading className="animate-fade-in-down">公告</PageHeaderHeading>
        </PageHeader>
        {data?.length ? (
          <div>
            
            {data.map((bulletin: Bulletin) => {
              return (
              <button
                type="button"
                className="w-full text-left py-4 border-b border-border transition-colors duration-150 hover:text-primary group"
                key={bulletin.id}
                onClick={() => {
                  setParams({ bulletin_detail_dialog: bulletin.id });
                }}
              >
                <p className="font-medium text-sm">{bulletin.title}</p>
                <p className="text-xs text-muted-foreground mt-1 truncate group-hover:text-muted-foreground">{bulletin.content}</p>
              </button>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground border-l-[3px] border-primary/20 pl-4 py-2 animate-fade-in">
            還沒有公告。
          </p>
        )}
      </div>
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            removeParams("bulletin_detail_dialog");
          }
        }}
      >
        <DialogContent className="h-4/5 flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {isDetailLoading ? (
                <Skeleton className="h-7 w-32" />
              ) : (
                bulletinDetail?.title
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="basis-full my-4">
            {isDetailLoading ? (
              <div className="flex flex-col gap-3">
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-52" />
                <Skeleton className="h-4 w-36" />
              </div>
            ) : (
              <TypographyP>
                <AutoLinkText text={bulletinDetail?.content ?? ""} />
              </TypographyP>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button className="w-full">關閉</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default Page;
