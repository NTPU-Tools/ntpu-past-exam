import { PageHeader } from "@/components/PageHeader";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TypographyH1 } from "@/components/ui/typography";
import { useRouter } from "next/router";

const AdminDashboard = () => {
  const router = useRouter();
  const query = router.query;

  const openSettingDialog = ({ settingField }: { settingField: string }) => {
    router.replace(
      {
        query: {
          ...query,
          [`open_edit_${settingField}_dialog`]: "true",
        },
      },
      undefined,
      { shallow: true },
    );
  };

  return (
    <div>
      <PageHeader>
        <TypographyH1>Admin Dashboard</TypographyH1>
      </PageHeader>
      <div className="grid grid-cols-2 gap-2">
        <Card
          className="hover:cursor-pointer"
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
          className="hover:cursor-pointer"
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
          className="hover:cursor-pointer"
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

        <Card className="blur-sm">
          <CardHeader>
            <CardTitle>公告管理</CardTitle>
            <CardDescription>管理網站公告</CardDescription>
          </CardHeader>
        </Card>
      </div>
      <Separator className="my-4 blur-sm" />
      <div className="grid grid-cols-2 gap-2 ">
        <Card className="blur-sm">
          <CardHeader>
            <CardTitle>考古題數量</CardTitle>
            <CardDescription>100</CardDescription>
          </CardHeader>
        </Card>
        <Card className="blur-sm">
          <CardHeader>
            <CardTitle>成員數量</CardTitle>
            <CardDescription>300</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
