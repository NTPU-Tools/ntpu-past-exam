import instance from "@/api/instance";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TypographyBlockquote,
  TypographyH1,
  TypographyP,
} from "@/components/ui/typography";
import { constant, omit, times } from "lodash-es";
import Head from "next/head";
import { useRouter } from "next/router";
import useSWR from "swr";

function Page() {
  const router = useRouter();

  const { data, isLoading } = useSWR(
    `${router.query.department_id}-bulletins`,
    () => instance.get(`/departments/${router.query.department_id}/bulletins`),
  );

  const dialogOpen = !!router.query?.bulletin_detail_dialog && data;

  const { data: bulletinDetail, isLoading: isDetailLoading } = useSWR(
    dialogOpen ? `bulletin-${router.query?.bulletin_detail_dialog}` : null,
    () => instance.get(`/bulletins/${router.query?.bulletin_detail_dialog}`),
  );

  const { data: departmentData } = useSWR(
    router.query.department_id
      ? `department-${router.query.department_id}`
      : null,
    () => instance.get(`/departments/${router.query.department_id}`),
  );

  if (isLoading) {
    return (
      <div className="relative">
        <PageHeader>
          <Skeleton className="h-12 w-[200px]" />
        </PageHeader>
        <div className="grid grid-cols-1 gap-4 my-4">
          {times(4, constant(1)).map((_, index) => (
            <Skeleton className="h-[122px] w-full" key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div>
        <Head>
          <title>{departmentData?.name} - NPTU 考古題</title>
        </Head>
        <PageHeader>
          <TypographyH1>社群公告</TypographyH1>
        </PageHeader>
        <div>
          {data?.length ? (
            data.map((bulletin) => (
              <div className="my-4">
                <Card
                  className="hover:bg-muted cursor-pointer"
                  onClick={() => {
                    router.replace(
                      {
                        query: {
                          ...router.query,
                          bulletin_detail_dialog: bulletin.id,
                        },
                      },
                      undefined,
                      { shallow: true },
                    );
                  }}
                >
                  <CardHeader className="flex flex-row">
                    <CardTitle className="truncate">{bulletin.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="truncate">
                    {bulletin.content}
                  </CardContent>
                </Card>
              </div>
            ))
          ) : (
            <TypographyBlockquote>暫無公告。</TypographyBlockquote>
          )}
        </div>
      </div>
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            router.replace(
              { query: omit(router.query, "bulletin_detail_dialog") },
              undefined,
              {
                shallow: true,
              },
            );
          }
        }}
      >
        <DialogContent className="h-4/5 flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {isDetailLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                bulletinDetail?.title
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="basis-full my-4">
            <TypographyP>
              {isDetailLoading ? (
                <div className="flex flex-col gap-4">
                  <Skeleton className="h-6 w-64" />
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-6 w-64" />
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-6 w-48" />
                </div>
              ) : (
                bulletinDetail?.content
              )}
            </TypographyP>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button>關閉</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default Page;
