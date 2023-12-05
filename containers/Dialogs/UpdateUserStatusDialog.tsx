import instance from "@/api/instance";
import { DataTable } from "@/components/ClientPaginationDataTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { CheckIcon } from "@radix-ui/react-icons";
import { createColumnHelper } from "@tanstack/react-table";
import { omit } from "lodash-es";
import { useRouter } from "next/router";
import { FC } from "react";
import useSWR, { mutate } from "swr";

interface pageProps {}

const UpdateUserStatusDialog: FC<pageProps> = () => {
  const router = useRouter();
  const query = router.query;
  const { toast } = useToast();

  const dialogOpen = query?.open_edit_member_dialog === "true";

  const { data } = useSWR(dialogOpen ? "inactive-users" : null, () =>
    instance.get("/users?is_active=false"),
  );

  function closeEditUserDialog() {
    router.replace(
      { query: omit(query, "open_edit_member_dialog") },
      undefined,
      {
        shallow: true,
      },
    );
  }

  const updateUserStatus = async ({
    is_active,
    id,
  }: {
    is_active: boolean;
    id: string;
  }) => {
    try {
      await instance.putForm(`/users/status/${id}`, {
        is_active,
      });
      toast({
        title: "操作成功",
      });
      mutate("inactive-users");
    } catch (e) {
      toast({
        title: "操作失敗",
        variant: "error",
      });
    }
  };

  const usersCol = createColumnHelper<any>();

  const columns: any[] = [
    usersCol.accessor("username", {
      header: "學號",
      size: 120,
      cell: (props) => <span>{props.getValue()}</span>,
    }),
    usersCol.accessor("readable_name", {
      header: "姓名",
      size: 120,
      cell: (props) => <span>{props.getValue() ?? "-"}</span>,
    }),
    usersCol.display({
      header: "審核",
      size: 120,
      cell: (props) => {
        const { id, username, readable_name, is } = props.row.original;
        return (
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    updateUserStatus({ is_active: true, id });
                  }}
                >
                  <CheckIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <TypographyP>
                  同意 {readable_name ?? username} 的申請
                </TypographyP>
              </TooltipContent>
            </Tooltip>
            {/* <Tooltip> */}
            {/*  <TooltipTrigger> */}
            {/*    <Button */}
            {/*      variant="outline" */}
            {/*      size="icon" */}
            {/*      onClick={() => { */}
            {/*        updateUserStatus({ is_active: false, id }); */}
            {/*      }} */}
            {/*    > */}
            {/*      <Cross2Icon /> */}
            {/*    </Button> */}
            {/*  </TooltipTrigger> */}
            {/*  <TooltipContent> */}
            {/*    <TypographyP> */}
            {/*      否決 {readable_name ?? username} 的申請 */}
            {/*    </TypographyP> */}
            {/*  </TooltipContent> */}
            {/* </Tooltip> */}
          </div>
        );
      },
    }),
  ];

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(open) => {
        if (!open) {
          closeEditUserDialog();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>審核成員</DialogTitle>
        </DialogHeader>

        <DataTable columns={columns} data={data} />
      </DialogContent>
    </Dialog>
  );
};

export default UpdateUserStatusDialog;
