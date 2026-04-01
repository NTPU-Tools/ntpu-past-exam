"use client";

import instance from "@/api-client/instance";
import { PageHeader } from "@/components/PageHeader";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TypographyH1 } from "@/components/ui/typography";
import { useQueryState } from "@/hooks/useQueryState";
import { useParams } from "next/navigation";
import useSWR from "swr";

const AdminDashboard = () => {
  const params = useParams();
  const adminDepartmentId = params.admin_department_id as string;
  const { setParams } = useQueryState();

  const { data } = useSWR(
    adminDepartmentId ? `department-${adminDepartmentId}` : null,
    () => instance.get(`/departments/${adminDepartmentId}`),
  );

  const openSettingDialog = ({ settingField }: { settingField: string }) => {
    setParams({ [`open_edit_${settingField}_dialog`]: "true" });
  };

  return (
    <div>
      <PageHeader>
        <TypographyH1>{data?.name} Admin Dashboard</TypographyH1>
      </PageHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
        <Card
          className="cursor-pointer"
          onClick={() => {
            openSettingDialog({ settingField: "course" });
          }}
        >
          <CardHeader>
            <CardTitle>編輯課程</CardTitle>
            <CardDescription>
              新增刪除修改課程後，社群成員可以選擇對應的課程上傳考古題
            </CardDescription>
          </CardHeader>
        </Card>

        <Card
          className="cursor-pointer"
          onClick={() => {
            openSettingDialog({ settingField: "member" });
          }}
        >
          <CardHeader>
            <CardTitle>管理社群成員</CardTitle>
            <CardDescription>
              管理社群成員加入申請，編輯成員權限（是否為管理員）
            </CardDescription>
          </CardHeader>
        </Card>

        <Card
          className="cursor-pointer"
          onClick={() => {
            openSettingDialog({ settingField: "post" });
          }}
        >
          <CardHeader>
            <CardTitle>審核考古題</CardTitle>
            <CardDescription>
              成員上傳的考古題會先等待審核，通過後才會顯示給其他使用者
            </CardDescription>
          </CardHeader>
        </Card>

        <Card
          className="cursor-pointer"
          onClick={() => {
            openSettingDialog({ settingField: "bulletin" });
          }}
        >
          <CardHeader>
            <CardTitle>公告管理</CardTitle>
            <CardDescription>管理社群公告</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
