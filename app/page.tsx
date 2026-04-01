"use client";

import instance from "@/api-client/instance";
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
import { useToast } from "@/components/ui/use-toast";
import { useQueryState } from "@/hooks/useQueryState";
import { filter, flatMap } from "lodash-es";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Clock, Loader2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import useSWR, { mutate } from "swr";

function Page() {
  const [applyLoading, setApplyLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { get, setParams, removeParams } = useQueryState();
  const { toast } = useToast();

  const { data, isLoading } = useSWR("departments-status", () =>
    instance.get("/departments/status"),
  );
  const { data: allDepartments } = useSWR("all-departments", () =>
    instance.get("/departments"),
  );
  const { data: userData } = useSWR("user-me", () =>
    instance.get("/users/me").catch(() => null),
  );

  useEffect(() => {
    if (searchParams.get("mode") === "select") return;
    if (!userData?.school_department || !data?.visible?.length) return;
    const userDepartment = data.visible.find(
      (dept: { name: string }) => dept.name === userData.school_department,
    );
    if (userDepartment) router.replace(`/${userDepartment.id}`);
  }, [userData, data]);

  const invisible_department = data
    ? filter(
        allDepartments,
        (department) =>
          !flatMap<{ [key: string]: [id: string] }>(data).some(
            (d) => d.id === department.id,
          ),
      )
    : [];

  const closeApplyDepartmentDialog = () => removeParams("apply_department_dialog");

  const applyToDepartment = async (department_id: string) => {
    try {
      setApplyLoading(true);
      await instance.post(`/departments/${department_id}/join-request/send`);
      toast({ title: "申請成功", variant: "success" });
      mutate("departments-status");
      closeApplyDepartmentDialog();
    } catch (error) {
      toast({ title: "申請失敗", variant: "error" });
    } finally {
      setApplyLoading(false);
    }
  };

  const applyDepartmentDialog = get("apply_department_dialog");

  if (isLoading || !data) {
    return (
      <div className="min-h-[calc(100dvh-3rem)]">
        <title>選擇社群 - NTPU 考古題</title>
        <div className="w-full max-w-lg mx-auto px-8 pt-20">
          <Skeleton className="h-12 w-48 mb-10" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full mb-1" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100dvh-3rem)]">
      <title>選擇社群 - NTPU 考古題</title>
      <div className="w-full max-w-lg mx-auto px-8 pt-20 pb-12">
        <h1 className="font-heading text-5xl sm:text-6xl font-black tracking-tighter leading-[1.05] mb-14">
          選一個<br />社群
        </h1>

        {data?.visible?.length > 0 && (
          <div>
            {data.visible.map((dept: any) => (
              <Link
                key={dept.id}
                href={`/${dept.id}`}
                className="flex items-center justify-between py-5 border-b border-border group"
              >
                <span className="text-xl font-semibold tracking-tight group-hover:text-primary transition-colors">{dept.name}</span>
                <span className="text-sm text-muted-foreground/20 group-hover:text-primary font-mono transition-colors">&rarr;</span>
              </Link>
            ))}
          </div>
        )}

        {data?.pending?.length > 0 && (
          <div className="mt-14">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4">等待審核</p>
            {data.pending.map((dept: any) => (
              <div
                key={dept.id}
                className="flex items-center gap-2.5 py-3 text-muted-foreground"
              >
                <Clock className="size-3 shrink-0" />
                <span className="text-sm">{dept.name}</span>
              </div>
            ))}
          </div>
        )}

        {invisible_department?.length > 0 && (
          <div className="mt-14">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4">其他社群</p>
            {invisible_department.map((dept: any) => (
              <button
                type="button"
                key={dept.id}
                className="flex items-center justify-between w-full py-3 text-sm text-muted-foreground hover:text-foreground text-left transition-colors group"
                onClick={() => setParams({ apply_department_dialog: dept.id })}
              >
                <span>{dept.name}</span>
                <Plus className="size-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        )}

        {!data?.visible?.length && !data?.pending?.length && !invisible_department?.length && (
          <p className="text-muted-foreground py-20">沒有可用的社群。</p>
        )}

        {!data?.visible?.length && invisible_department?.length > 0 && (
          <p className="text-sm text-muted-foreground mt-8">
            還沒加入任何社群 &mdash; 從上方選一個申請加入
          </p>
        )}
      </div>

      <Dialog
        open={!!applyDepartmentDialog && !!invisible_department?.length}
        onOpenChange={(open) => { if (!open) closeApplyDepartmentDialog(); }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>申請加入</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            送出後需等待{" "}
            <span className="font-medium text-foreground">
              {invisible_department.find((d) => d.id === applyDepartmentDialog)?.name}
            </span>
            {" "}的管理員審核。
          </p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={applyLoading}>取消</Button>
            </DialogClose>
            <Button
              disabled={applyLoading}
              onClick={() => applyToDepartment(applyDepartmentDialog as string)}
            >
              {applyLoading && <Loader2 className="animate-spin" />}
              送出
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Page;
