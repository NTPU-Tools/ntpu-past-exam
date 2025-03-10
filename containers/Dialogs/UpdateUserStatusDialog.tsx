import instance from "@/api-client/instance";
import { DataTable } from "@/components/ClientPaginationDataTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TypographyP } from "@/components/ui/typography";
import { useToast } from "@/components/ui/use-toast";
import userStore from "@/store/userStore";
import {
  StarIcon,
  StarFilledIcon,
  CheckIcon,
  MixerHorizontalIcon,
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

  const { data: membersData, isLoading } = useSWR(
    dialogOpen && router.query.admin_department_id
      ? `${router.query.admin_department_id}-members`
      : null,
    () =>
      instance.get(`/departments/${router.query.admin_department_id}/members`),
  );

  const { data: pendingData } = useSWR(
    dialogOpen && router.query.admin_department_id
      ? `${router.query.admin_department_id}-pending`
      : null,
    () =>
      instance.get(
        `/departments/${router.query.admin_department_id}/join-request`,
      ),
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

  const updateMemberStatus = async ({
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
      // if (field === "status") {
      //   await instance.putForm(`/users/status/${id}`, {
      //     is_active,
      //   });
      // }
      if (field === "admin") {
        await instance.putForm(
          `/departments/${router.query.admin_department_id}/admin`,
          {
            is_admin,
            user_id: id,
          },
        );
      }
      toast({
        title: "操作成功",
      });
      mutate(`${router.query.admin_department_id}-members`);
    } catch (e) {
      toast({
        title: "操作失敗",
        variant: "error",
      });
    }
  };

  const approveJoinRequest = async ({ id }: { id: string }) => {
    try {
      await instance.put(
        `/departments/join-request/${router.query.admin_department_id}/approve/${id}`,
      );
      mutate(`${router.query.admin_department_id}-members`);
      mutate(`${router.query.admin_department_id}-pending`);
      toast({
        title: "操作成功",
      });
    } catch (e) {
      toast({
        title: "操作失敗",
        variant: "error",
      });
    }
  };

  const openUserDetailDialog = ({ id }: { id: string }) => {
    router.replace(
      {
        query: {
          ...query,
          open_user_detail_dialog: "true",
          user_detail_id: id,
        },
      },
      undefined,
      { shallow: true },
    );
  };
  function closeUserDetailDialog() {
    router.replace(
      {
        query: omit(query, ["open_user_detail_dialog", "user_detail_id"]),
      },
      undefined,
      {
        shallow: true,
      },
    );
  }

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
    usersCol.accessor("school_department", {
      header: "系級",
      size: 120,
      cell: (props) => <span>{props.getValue() ?? "-"}</span>,
    }),
    usersCol.display({
      header: "操作",
      size: 120,
      cell: (props) => {
        const {
          id,
          username,
          readable_name,
          status,
          user_id,
          is_department_admin,
        } = props.row.original;
        return (
          <div className="flex gap-2">
            {status === "PENDING" && (
              <div className="flex gap-1">
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => openUserDetailDialog({ id: user_id })}
                    >
                      <MixerHorizontalIcon />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <TypographyP>查看 {readable_name} 的資訊</TypographyP>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        approveJoinRequest({ id });
                      }}
                    >
                      <CheckIcon />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <TypographyP>
                      通過 {readable_name ?? username} 的申請
                    </TypographyP>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
            {!status && (
              <Tooltip>
                <TooltipTrigger disabled={user_id === userData?.id}>
                  <Button
                    disabled={user_id === userData?.id}
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      updateMemberStatus({
                        is_admin: !is_department_admin,
                        id: user_id,
                        field: "admin",
                      });
                    }}
                  >
                    {is_department_admin ? <StarFilledIcon /> : <StarIcon />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <TypographyP>
                    {is_department_admin
                      ? `降級 ${readable_name ?? username} 為社群普通用戶`
                      : `給予 ${readable_name ?? username} 管理社群權限`}
                  </TypographyP>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        );
      },
    }),
  ];

  const userDetailDialogOpen =
    !!query?.user_detail_id && query?.open_user_detail_dialog === "true";

  const { data: userDetailData } = useSWR(
    userDetailDialogOpen ? `${query?.user_detail_id}-detail` : null,
    () => instance.get(`/users/${query?.user_detail_id}`),
  );

  return (
    <>
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            if (isLoading && !membersData) return;
            closeEditUserDialog();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>管理社群成員</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="members">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="members">管理成員</TabsTrigger>
              <TabsTrigger value="apply">審核申請</TabsTrigger>
            </TabsList>
            <TabsContent value="members">
              <DataTable columns={columns} data={membersData} />
            </TabsContent>
            <TabsContent value="apply">
              <DataTable columns={columns} data={pendingData} />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      <Dialog
        open={userDetailDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeUserDetailDialog();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>詳細資訊</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <p className="text-4xl font-extrabold">
              {userDetailData?.readable_name}
            </p>
            <p className="text-lg">{userDetailData?.school_department}</p>

            <hr />
            <p className="whitespace-break-spaces">{userDetailData?.note}</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UpdateUserStatusDialog;
