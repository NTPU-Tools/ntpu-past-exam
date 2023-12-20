import instance from "@/api/instance";
import { DataTable } from "@/components/ClientPaginationDataTable";
import PDFViewer from "@/components/PDFViewer";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TypographyP } from "@/components/ui/typography";
import { useToast } from "@/components/ui/use-toast";
import { MixerHorizontalIcon } from "@radix-ui/react-icons";
import { createColumnHelper } from "@tanstack/react-table";
import { map, omit } from "lodash-es";
import { useRouter } from "next/router";
import { FC, useState } from "react";
import useSWR, { mutate } from "swr";

interface pageProps {}

const UpdatePostStatusDialog: FC<pageProps> = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const query = router.query;
  const { toast } = useToast();

  const dialogOpen = query?.open_edit_post_dialog === "true";
  const postDetailDialogOpen =
    !!query?.edit_post_detail_id &&
    query?.open_edit_post_detail_dialog === "true";

  const { data, isLoading: isRootLoading } = useSWR(
    dialogOpen && router.query.admin_department_id
      ? `${router.query.admin_department_id}-pending-posts`
      : null,
    () =>
      instance.get(
        `/posts?department_id=${router.query.admin_department_id}&status=PENDING`,
      ),
  );

  const { data: postData } = useSWR(
    dialogOpen && postDetailDialogOpen
      ? `post-${query?.edit_post_detail_id}`
      : null,
    () => instance.get(`/posts/${query?.edit_post_detail_id}`),
  );

  function closePostsDialog() {
    router.replace({ query: omit(query, "open_edit_post_dialog") }, undefined, {
      shallow: true,
    });
  }

  const openPostDetailDialog = ({ id }: { id: string }) => {
    router.replace(
      {
        query: {
          ...query,
          open_edit_post_detail_dialog: "true",
          edit_post_detail_id: id,
        },
      },
      undefined,
      { shallow: true },
    );
  };
  function closePostDetailDialog() {
    router.replace(
      {
        query: omit(query, [
          "open_edit_post_detail_dialog",
          "edit_post_detail_id",
        ]),
      },
      undefined,
      {
        shallow: true,
      },
    );
  }

  const postsCol = createColumnHelper<any>();

  const columns: any[] = [
    postsCol.accessor("course_name", {
      header: "課程",
      size: 120,
      cell: (props) => <span>{props.getValue()}</span>,
    }),
    postsCol.accessor("title", {
      header: "標題",
      size: 120,
      cell: (props) => <span>{props.getValue()}</span>,
    }),
    postsCol.display({
      header: "查看",
      size: 120,
      cell: (props) => {
        const { id, title } = props.row.original;
        return (
          <div>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => openPostDetailDialog({ id })}
                >
                  <MixerHorizontalIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <TypographyP>查看 {title} 的內容</TypographyP>
              </TooltipContent>
            </Tooltip>
          </div>
        );
      },
    }),
  ];

  const updatePostStatus = async ({ status }: { status: string }) => {
    try {
      setIsLoading(true);
      await instance.putForm(`/posts/status/${query?.edit_post_detail_id}`, {
        status,
      });
      toast({
        title: "操作成功",
      });
      mutate(`${router.query.admin_department_id}-pending-posts`);
      mutate(`post-${query?.edit_post_detail_id}`);
      closePostDetailDialog();
    } catch (e) {
      toast({
        title: "操作失敗",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            if (isRootLoading && !data) return;
            closePostsDialog();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>審核考古題</DialogTitle>
          </DialogHeader>

          <DataTable columns={columns} data={data} />
        </DialogContent>
      </Dialog>

      <Dialog
        open={postDetailDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            closePostDetailDialog();
          }
        }}
      >
        <DialogContent className="flex flex-col justify-start">
          <DialogHeader>
            <DialogTitle>審核考古題: {postData?.title}</DialogTitle>
          </DialogHeader>

          <TypographyP>{postData?.content}</TypographyP>
          {postData?.files &&
            map(postData?.files, (fileLink, index) => (
              <PDFViewer key={index} src={fileLink} className="w-full" />
            ))}

          <DialogFooter>
            {/* <DialogClose asChild> */}
            {/*  <Button */}
            {/*    variant="outline" */}
            {/*    onClick={() => { */}
            {/*      updatePostStatus({ status: "REJECTED" }); */}
            {/*    }} */}
            {/*    isLoading={isLoading} */}
            {/*  > */}
            {/*    不通過 */}
            {/*  </Button> */}
            {/* </DialogClose> */}
            <Button
              onClick={() => {
                updatePostStatus({ status: "APPROVED" });
              }}
              isLoading={isLoading}
            >
              通過
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UpdatePostStatusDialog;
