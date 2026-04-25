import instance from "@/api-client/instance";
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
import { Loader2 } from "lucide-react";
import { createColumnHelper } from "@tanstack/react-table";
import { map } from "lodash-es";
import { useParams } from "next/navigation";
import { useQueryState } from "@/hooks/useQueryState";
import { swrKeys } from "@/lib/swr-keys";
import { FC, useState } from "react";
import useSWR, { mutate } from "swr";

interface pageProps {}

const UpdatePostStatusDialog: FC<pageProps> = () => {
  const [isLoading, setIsLoading] = useState(false);
  const params = useParams();
  const { get, setParams, removeParams } = useQueryState();
  const { toast } = useToast();

  const dialogOpen = get("open_edit_post_dialog") === "true";
  const postDetailDialogOpen =
    !!get("edit_post_detail_id") &&
    get("open_edit_post_detail_dialog") === "true";

  const { data, isLoading: isRootLoading, mutate: mutatePendingPosts } = useSWR(
    dialogOpen && params.admin_department_id
      ? swrKeys.departmentPendingPosts(params.admin_department_id as string)
      : null,
    () =>
      instance.get(
        `/posts?department_id=${params.admin_department_id}&status=PENDING`,
      ),
  );

  const { data: postData, mutate: mutatePost } = useSWR(
    dialogOpen && postDetailDialogOpen
      ? swrKeys.post(get("edit_post_detail_id") as string)
      : null,
    () => instance.get(`/posts/${get("edit_post_detail_id")}`),
  );

  function closePostsDialog() {
    removeParams("open_edit_post_dialog");
  }

  const openPostDetailDialog = ({ id }: { id: string }) => {
    setParams({ open_edit_post_detail_dialog: "true", edit_post_detail_id: id });
  };
  function closePostDetailDialog() {
    removeParams("open_edit_post_detail_dialog", "edit_post_detail_id");
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
              <TooltipTrigger asChild>
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
      const updatedPost = await instance.putForm(
        `/posts/status/${params.admin_department_id}/${get("edit_post_detail_id")}`,
        {
          status,
        },
      );
      toast({
        title: "操作成功",
      });
      await mutatePost(updatedPost, { revalidate: false });
      await mutatePendingPosts();
      if (postData?.course_id) {
        await mutate(swrKeys.course(postData.course_id));
      }
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
        <DialogContent className="max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>審核考古題</DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto flex-1">
            <DataTable columns={columns} data={data} />
          </div>
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
        <DialogContent className="max-h-[85vh] flex flex-col justify-start">
          <DialogHeader>
            <DialogTitle>審核考古題: {postData?.title}</DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto flex-1">
            <TypographyP>{postData?.content}</TypographyP>
            {postData?.files &&
              map(postData?.files, (fileLink, index) => (
                <PDFViewer key={index} src={fileLink} className="w-full" />
              ))}
          </div>

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
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="animate-spin" />}
              通過
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UpdatePostStatusDialog;
