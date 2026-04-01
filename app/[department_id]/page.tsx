"use client";

import instance from "@/api-client/instance";
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
import { constant, times } from "lodash-es";
import { useParams } from "next/navigation";
import useSWR from "swr";

function Page() {
  const params = useParams();
  const departmentId = params.department_id as string;
  const { get, setParams, removeParams } = useQueryState();

  const { data, isLoading } = useSWR(
    `${departmentId}-bulletins`,
    () => instance.get(`/departments/${departmentId}/bulletins`),
  );

  const bulletinDetailId = get("bulletin_detail_dialog");
  const dialogOpen = !!bulletinDetailId && data;

  const { data: bulletinDetail, isLoading: isDetailLoading } = useSWR(
    dialogOpen ? `bulletin-${bulletinDetailId}` : null,
    () => instance.get(`/bulletins/${bulletinDetailId}`),
  );

  const { data: departmentData } = useSWR(
    departmentId ? `department-${departmentId}` : null,
    () => instance.get(`/departments/${departmentId}`),
  );

  if (isLoading) {
    return (
      <div>
        <PageHeader>
          <Skeleton className="h-9 w-[140px]" />
        </PageHeader>
        <div className="space-y-px">
          {times(4, constant(1)).map((_: any, index: number) => (
            <Skeleton className="h-16 w-full" key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div>
        <title>{departmentData?.name} - NTPU 考古題</title>
        <PageHeader>
          <PageHeaderHeading>公告</PageHeaderHeading>
        </PageHeader>
        {data?.length ? (
          <div>
            {data.map((bulletin: any, idx: number) => (
              <button
                type="button"
                className="w-full text-left py-4 border-b border-border transition-colors hover:text-primary group"
                key={idx}
                onClick={() => {
                  setParams({ bulletin_detail_dialog: bulletin.id });
                }}
              >
                <p className="font-medium text-sm">{bulletin.title}</p>
                <p className="text-xs text-muted-foreground mt-1 truncate group-hover:text-muted-foreground">{bulletin.content}</p>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground border-l-[3px] border-primary/20 pl-4 py-2">
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
            <TypographyP>
              {isDetailLoading ? (
                <div className="flex flex-col gap-3">
                  <Skeleton className="h-4 w-64" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-52" />
                  <Skeleton className="h-4 w-36" />
                </div>
              ) : (
                bulletinDetail?.content
              )}
            </TypographyP>
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
