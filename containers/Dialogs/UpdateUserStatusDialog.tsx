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
import userStore from "@/store/userStore";
import {
  LockClosedIcon,
  LockOpen1Icon,
  StarIcon,
  StarFilledIcon,
} from "@radix-ui/react-icons";
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
  const { userData } = userStore();

  const dialogOpen = query?.open_edit_member_dialog === "true";

  const { data } = useSWR(dialogOpen ? "inactive-users" : null, () =>
    instance.get("/users"),
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
    is_admin,
    field = "status",
    id,
  }: {
    is_active?: boolean;
    is_admin?: boolean;
    id: string;
    field?: string;
  }) => {
    try {
      if (field === "status") {
        await instance.putForm(`/users/status/${id}`, {
          is_active,
        });
      }
      if (field === "admin") {
        await instance.putForm(`/users/admin/${id}`, {
          is_admin,
        });
      }
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
      header: "操作",
      size: 120,
      cell: (props) => {
        const { id, username, readable_name, is_active, is_admin } =
          props.row.original;
        return (
          <div className="flex gap-2">
            {is_active ? (
              <Tooltip>
                <TooltipTrigger disabled={id === userData?.id}>
                  <Button
                    disabled={id === userData?.id}
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      updateUserStatus({ is_active: false, id });
                    }}
                  >
                    <LockOpen1Icon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <TypographyP>
                    停用 {readable_name ?? username} 的帳號
                  </TypographyP>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip>
                <TooltipTrigger disabled={id === userData?.id}>
                  <Button
                    disabled={id === userData?.id}
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      updateUserStatus({ is_active: true, id });
                    }}
                  >
                    <LockClosedIcon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <TypographyP>
                    啟用 {readable_name ?? username} 的帳號
                  </TypographyP>
                </TooltipContent>
              </Tooltip>
            )}
            {is_admin ? (
              <Tooltip>
                <TooltipTrigger disabled={id === userData?.id}>
                  <Button
                    disabled={id === userData?.id}
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      updateUserStatus({ is_admin: false, id, field: "admin" });
                    }}
                  >
                    <StarFilledIcon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <TypographyP>
                    降級 {readable_name ?? username} 為普通用戶
                  </TypographyP>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip>
                <TooltipTrigger disabled={id === userData?.id}>
                  <Button
                    disabled={id === userData?.id}
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      updateUserStatus({ is_admin: true, id, field: "admin" });
                    }}
                  >
                    <StarIcon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <TypographyP>
                    升級 {readable_name ?? username} 成為管理員
                  </TypographyP>
                </TooltipContent>
              </Tooltip>
            )}
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
          <DialogTitle>管理成員</DialogTitle>
        </DialogHeader>

        <DataTable columns={columns} data={data} />
      </DialogContent>
    </Dialog>
  );
};

export default UpdateUserStatusDialog;
