import instance from "@/api/instance";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { loginSchema } from "@/schemas/login";
import { setCookie } from "@/utils/cookie";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import * as z from "zod";

const LoginPage = () => {
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      const data = await instance.postForm("/login", values);
      setCookie("ntpu-past-exam-access-token", data.access_token, 30);
      setCookie("ntpu-past-exam-refresh-token", data.refresh_token, 365);
      setTimeout(() => {
        router.replace("/");
      }, 1000);
      instance.defaults.headers.Authorization = `Bearer ${data.access_token}`;
      toast({
        title: "登入成功",
      });
    } catch (e) {
      form.setError("root", { message: "帳號或密碼錯誤" });
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="w-full h-full flex justify-center items-center">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>登入</CardTitle>
            <CardDescription>帳號密碼與學生資訊系統相同。</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form>
                <div className="grid w-full items-center gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>學號</FormLabel>
                          <FormControl>
                            <Input placeholder="請輸入學號" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>密碼</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="請輸入密碼"
                              type="password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormMessage>
                    {form.formState.errors.root?.message}
                  </FormMessage>
                </div>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button className="w-full" onClick={form.handleSubmit(onSubmit)}>
              登入
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
