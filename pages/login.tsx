import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FC } from "react";

interface pageProps {}

const login: FC<pageProps> = () => (
  <div className="h-[calc(100vh-8rem)]">
    <div className="w-full h-full flex justify-center items-center">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>登入</CardTitle>
          <CardDescription>帳號密碼與學生資訊系統相同。</CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="stud_num">學號</Label>
                <Input id="stud_num" placeholder="請輸入學號" />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">密碼</Label>
                <Input id="password" placeholder="請輸入密碼" />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button className="w-full">登入</Button>
        </CardFooter>
      </Card>
    </div>
  </div>
);

export default login;
