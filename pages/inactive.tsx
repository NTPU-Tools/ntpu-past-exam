import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const InactivePage = () => (
  <div className="h-[calc(100vh-8rem)]">
    <div className="w-full h-full flex justify-center items-center">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>帳號未啟用</CardTitle>
          <CardDescription>管理員正在審核你的申請。</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full items-center gap-4">請稍後再回來！</div>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default InactivePage;
InactivePage.title = "帳號未啟用";
