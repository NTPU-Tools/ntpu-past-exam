/* eslint-disable */
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
import { TypographySmall } from "@/components/ui/typography";
import { useToast } from "@/components/ui/use-toast";
import ServiceTermDialog from "@/containers/Dialogs/ServiceTermDialog";
import { loginSchema } from "@/schemas/login";
import userStore from "@/store/userStore";
import { setCookie } from "@/utils/cookie";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const LoginPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(!!router.query.code);
  const { toast } = useToast();
  const [openTerm, setOpenTerm] = useState(false);
  const { setUserData } = userStore();
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      setIsLoading(true);
      const data = await instance.postForm("/login", values);
      setUserData(data);
      setCookie("ntpu-past-exam-access-token", data.access_token, 30);
      setCookie("ntpu-past-exam-refresh-token", data.refresh_token, 365);
      instance.defaults.headers.authorization = `Bearer ${data.access_token}`;
      toast({
        title: "登入成功",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (e) {
      form.setError("root", { message: "帳號或密碼錯誤" });
    } finally {
      setIsLoading(false);
    }
  };

  const login = useGoogleLogin({
    flow: "auth-code",
    ux_mode: "redirect",
    redirect_uri: `${window.location.origin}/login`,
  });

  const login_with_google_code_flow = async () => {
    if (router.query.code) {
      try {
        const data = await instance.postForm(`/exchange`, {
          code: router.query.code,
          redirect_uri: `${window.location.origin}/login`,
        });
        setCookie("ntpu-past-exam-access-token", data.access_token, 30);
        setCookie("ntpu-past-exam-refresh-token", data.refresh_token, 365);
        instance.defaults.headers.authorization = `Bearer ${data.access_token}`;
        toast({
          title: "登入成功",
        });
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      } catch (e) {
        toast({
          title: "登入失敗",
          variant: "error",
        });
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    login_with_google_code_flow();
  }, []);

  return (
    <>
      <div className="h-[calc(100vh-8rem)]">
        <div className="w-full h-full flex justify-center items-center">
          <Card className="w-[350px]">
            <CardHeader>
              <CardTitle>登入</CardTitle>
              <CardDescription>
                僅限使用學校配發之 Google 學術帳號。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                isLoading={isLoading}
                className="w-full my-2"
                onClick={() => {
                  setIsLoading(true);
                  login();
                }}
              >
                使用 Google 登入
              </Button>
              {/* <Form {...form}> */}
              {/*  <form */}
              {/*    onSubmit={(event) => { */}
              {/*      event.preventDefault(); */}
              {/*      form.handleSubmit(onSubmit)(); */}
              {/*    }} */}
              {/*  > */}
              {/*    <div className="grid w-full items-center gap-4"> */}
              {/*      <div className="flex flex-col space-y-1.5"> */}
              {/*        <FormField */}
              {/*          control={form.control} */}
              {/*          name="username" */}
              {/*          render={({ field }) => ( */}
              {/*            <FormItem> */}
              {/*              <FormLabel>學號</FormLabel> */}
              {/*              <FormControl> */}
              {/*                <Input placeholder="請輸入學號" {...field} /> */}
              {/*              </FormControl> */}
              {/*              <FormMessage /> */}
              {/*            </FormItem> */}
              {/*          )} */}
              {/*        /> */}
              {/*      </div> */}
              {/*      <div className="flex flex-col space-y-1.5"> */}
              {/*        <FormField */}
              {/*          control={form.control} */}
              {/*          name="password" */}
              {/*          render={({ field }) => ( */}
              {/*            <FormItem> */}
              {/*              <FormLabel>密碼</FormLabel> */}
              {/*              <FormControl> */}
              {/*                <Input */}
              {/*                  placeholder="請輸入密碼" */}
              {/*                  type="password" */}
              {/*                  {...field} */}
              {/*                /> */}
              {/*              </FormControl> */}
              {/*              <FormMessage /> */}
              {/*            </FormItem> */}
              {/*          )} */}
              {/*        /> */}
              {/*      </div> */}
              {/*      <FormMessage> */}
              {/*        {form.formState.errors.root?.message} */}
              {/*      </FormMessage> */}
              {/*      <Button className="w-full my-2" isLoading={isLoading}> */}
              {/*        登入 */}
              {/*      </Button> */}
              {/*    </div> */}
              {/*  </form> */}
              {/* </Form> */}
            </CardContent>
            <CardFooter>
              <div className="flex justify-center w-full">
                <TypographySmall>
                  登入即代表您同意我們的
                  {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
                  <span
                    className="hover:underline cursor-pointer font-extrabold mx-1"
                    onClick={() => setOpenTerm(true)}
                  >
                    服務條款
                  </span>
                  。
                </TypographySmall>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
      <ServiceTermDialog open={openTerm} close={() => setOpenTerm(false)} />
    </>
  );
};

export default LoginPage;
LoginPage.title = "登入";
