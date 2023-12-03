import { PageHeader } from "@/components/PageHeader";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TypographyH1 } from "@/components/ui/typography";

const AdminDashboard = () => (
  <div>
    <PageHeader>
      <TypographyH1>Admin Dashboard</TypographyH1>
    </PageHeader>
    <div className="grid grid-cols-2 gap-2">
      <Card>
        <CardHeader>
          <CardTitle>新增課程</CardTitle>
          <CardDescription>
            新增課程後，社群成員可以選擇該課程上傳考古題
          </CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>管理社群成員</CardTitle>
          <CardDescription>
            管理社群成員加入申請，編輯成員權限（是否為管理員）
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>公告管理</CardTitle>
          <CardDescription>管理網站公告</CardDescription>
        </CardHeader>
      </Card>
    </div>
    <Separator className="my-4" />
    <div className="grid grid-cols-2 gap-2 ">
      <Card>
        <CardHeader>
          <CardTitle>考古題數量</CardTitle>
          <CardDescription>100</CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>成員數量</CardTitle>
          <CardDescription>300</CardDescription>
        </CardHeader>
      </Card>
    </div>
  </div>
);

export default AdminDashboard;
