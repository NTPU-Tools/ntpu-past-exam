import instance from "@/api/instance";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ScrollArea from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { TypographyBlockquote, TypographyP } from "@/components/ui/typography";
import { useToast } from "@/components/ui/use-toast";
import { filter, flatMap, omit } from "lodash-es";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import useSWR, { mutate } from "swr";

function Page() {
  const [applyLoading, setApplyLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const { data, isLoading } = useSWR("departments-status", () =>
    instance.get("/departments/status"),
  );

  const { data: allDepartments } = useSWR("all-departments", () =>
    instance.get("/departments"),
  );

  const defaultTab = useMemo(() => {
    if (!data) return "visible";
    if (data.visible.length) return "visible";
    if (data.pending.length) return "pending";
    return "invisible";
  }, [data]);

  const invisible_department = data
    ? filter(
        allDepartments,
        (department) =>
          !flatMap<{ [key: string]: [id: string] }>(data).some(
            (d) => d.id === department.id,
          ),
      )
    : [];

  const openApplyDepartmentDialog = (department_id: string) => {
    router.replace(
      {
        query: {
          ...router.query,
          apply_department_dialog: department_id,
        },
      },
      undefined,
      { shallow: true },
    );
  };

  const closeApplyDepartmentDialog = () => {
    router.replace(
      {
        query: omit(router.query, "apply_department_dialog"),
      },
      undefined,
      { shallow: true },
    );
  };

  const applyToDepartment = async (department_id: string) => {
    try {
      setApplyLoading(true);
      await instance.post(`/departments/${department_id}/join-request/send`);
      toast({
        title: "申請成功",
        variant: "success",
      });
      mutate("departments-status");
      closeApplyDepartmentDialog();
    } catch (error) {
      toast({
        title: "申請失敗",
        variant: "error",
      });
    } finally {
      setApplyLoading(false);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="h-[calc(100vh-8rem)]">
        <div className="w-full h-full flex justify-center items-center">
          <Card className="w-[350px]">
            <CardHeader>
              <Skeleton className="h-8 w-36" />
              <Skeleton className="h-4 w-52" />
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-72" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-72" />
              <Skeleton className="h-4 w-52" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="w-full h-full flex justify-center items-center">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>進入社群</CardTitle>
            <CardDescription>請選擇社群。</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion
              type="single"
              collapsible
              defaultValue={data?.visible?.length > 0 ? "visible" : "invisible"}
            >
              <AccordionItem value={defaultTab}>
                <AccordionTrigger>已加入的社群</AccordionTrigger>
                <AccordionContent>
                  <ScrollArea className="max-h-[250px] overflow-y-auto">
                    <div className="flex flex-col gap-2">
                      {data?.visible?.length ? (
                        data?.visible.map((department, index) => (
                          <Link
                            key={index}
                            className="flex items-center space-x-4 rounded-md border p-4 hover:bg-muted"
                            href={`/${department.id}`}
                          >
                            {department.name}
                          </Link>
                        ))
                      ) : (
                        <TypographyBlockquote>
                          尚未加入任何社群
                        </TypographyBlockquote>
                      )}
                    </div>
                  </ScrollArea>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="pending">
                <AccordionTrigger>審核中的社群</AccordionTrigger>
                <AccordionContent>
                  <ScrollArea className="max-h-[250px] overflow-y-auto">
                    <div className="flex flex-col gap-2">
                      {data?.pending?.length ? (
                        data?.pending.map((department, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-4 rounded-md border p-4 hover:bg-muted cursor-not-allowed"
                          >
                            {department.name}
                          </div>
                        ))
                      ) : (
                        <TypographyBlockquote>
                          尚未申請加入任何社群
                        </TypographyBlockquote>
                      )}
                    </div>
                  </ScrollArea>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="invisible">
                <AccordionTrigger>尚未加入的社群</AccordionTrigger>
                <AccordionContent>
                  <ScrollArea className="max-h-[250px] overflow-y-auto">
                    <div className="flex flex-col gap-2">
                      {invisible_department?.length ? (
                        invisible_department.map((department, index) => (
                          <button
                            type="button"
                            key={index}
                            className="flex items-center w-full space-x-4 rounded-md border p-4 hover:bg-muted"
                            onClick={() => {
                              openApplyDepartmentDialog(department.id);
                            }}
                          >
                            {department.name}
                          </button>
                        ))
                      ) : (
                        <TypographyBlockquote>
                          已加入所有社群，請聯絡平台新增更多社群
                        </TypographyBlockquote>
                      )}
                    </div>
                  </ScrollArea>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
      <Dialog
        open={
          !!router.query.apply_department_dialog &&
          !!invisible_department?.length
        }
        onOpenChange={(open) => {
          if (!open) {
            closeApplyDepartmentDialog();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>申請加入社群</DialogTitle>
          </DialogHeader>

          <div className="basis-full my-4">
            <TypographyP>
              確認申請加入{" "}
              {
                invisible_department.filter(
                  (d) => d.id === router.query.apply_department_dialog,
                )[0]?.name
              }
            </TypographyP>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button isLoading={applyLoading} variant="outline">
                關閉
              </Button>
            </DialogClose>

            <Button
              isLoading={applyLoading}
              onClick={() => {
                applyToDepartment(
                  router.query.apply_department_dialog as string,
                );
              }}
            >
              確認
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Page;
Page.title = "選擇社群";
