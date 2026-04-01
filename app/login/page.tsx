/* eslint-disable */
"use client";

import instance from "@/api-client/instance";
import { Button } from "@/components/ui/button";
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
import ServiceTermDialog from "@/containers/Dialogs/ServiceTermDialog";
import { loginSchema } from "@/schemas/login";
import userStore from "@/store/userStore";
import { setCookie } from "@/utils/cookie";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGoogleLogin } from "@react-oauth/google";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { isEmbedded, useDeviceSelectors, isMobile } from "react-device-detect";
import { useForm } from "react-hook-form";
import * as z from "zod";

const googleLoginBlacklist = ["Line", "Instagram", "Facebook"];

const LoginPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(!!searchParams.get("code"));
  const { toast } = useToast();
  const [openTerm, setOpenTerm] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const { setUserData } = userStore();
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema as any),
  });
  const [selectors] = useDeviceSelectors(
    typeof window !== "undefined" ? window.navigator.userAgent : "",
  );

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      setIsLoading(true);
      const data = await instance.postForm("/login", values);
      setUserData(data);
      setCookie("ntpu-past-exam-access-token", data.access_token, 30);
      setCookie("ntpu-past-exam-refresh-token", data.refresh_token, 365);
      instance.defaults.headers.authorization = `Bearer ${data.access_token}`;
      toast({ title: "登入成功" });
      setTimeout(() => { window.location.href = "/"; }, 1000);
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
    const code = searchParams.get("code");
    if (code) {
      try {
        const data = await instance.postForm(`/exchange`, {
          code,
          redirect_uri: `${window.location.origin}/login`,
        });
        setCookie("ntpu-past-exam-access-token", data.access_token, 30);
        setCookie("ntpu-past-exam-refresh-token", data.refresh_token, 365);
        instance.defaults.headers.authorization = `Bearer ${data.access_token}`;
        toast({ title: "登入成功" });
        setTimeout(() => { window.location.href = "/"; }, 1000);
      } catch (e) {
        toast({ title: "登入失敗", variant: "error" });
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    login_with_google_code_flow();
  }, [searchParams]);

  const isBlacklisted = googleLoginBlacklist.includes(selectors.browserName) || isEmbedded;

  return (
    <>
      <title>登入 - NTPU 考古題</title>
      <div className="min-h-[calc(100dvh-3.5rem)] flex">
        {/* Left: branding */}
        <div className="hidden lg:flex lg:w-[45%] bg-primary items-end p-12">
          <div>
            <h1 className="font-heading text-5xl font-black tracking-tight text-primary-foreground leading-[1.1]">
              考古題，<br />找到了。
            </h1>
            <p className="text-primary-foreground/70 mt-4 text-base max-w-xs">
              北大學生共建的考古題資料庫。上傳、搜尋、通過考試。
            </p>
          </div>
        </div>

        {/* Right: login form */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-sm">
            {/* Mobile-only title */}
            <div className="lg:hidden mb-12">
              <h1 className="font-heading text-4xl font-black tracking-tight leading-[1.1]">
                考古題，<br />找到了。
              </h1>
              <p className="text-muted-foreground mt-3 text-sm">
                北大學生共建的考古題資料庫。
              </p>
            </div>

            <div className="lg:mb-0">
              <p className="text-sm font-medium mb-6 text-muted-foreground">用學校帳號登入開始使用</p>

              <Button
                disabled={isLoading || isBlacklisted}
                className="w-full h-12 text-base font-semibold"
                size="lg"
                onClick={() => { setIsLoading(true); login(); }}
              >
                {isLoading && <Loader2 className="animate-spin" />}
                {isBlacklisted ? "請使用內建瀏覽器" : "Google 登入"}
              </Button>

              <p className="text-[11px] text-muted-foreground mt-3">
                僅限 @gm.ntpu.edu.tw 學術帳號
              </p>

              {isMobile && (
                <p className="text-[11px] text-destructive mt-2">
                  偵測到手機內嵌瀏覽器，請改用 Safari 或 Chrome。
                </p>
              )}

              {!adminMode && (
                <button
                  type="button"
                  className="text-[11px] text-muted-foreground/60 hover:text-muted-foreground mt-6 block transition-colors"
                  onClick={() => setAdminMode(true)}
                >
                  帳號密碼登入
                </button>
              )}

              {adminMode && (
                <Form {...form}>
                  <form
                    onSubmit={(event) => { event.preventDefault(); form.handleSubmit(onSubmit)(); }}
                    className="mt-6 pt-6 border-t space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>帳號</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>密碼</FormLabel>
                          <FormControl><Input type="password" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormMessage>{form.formState.errors.root?.message}</FormMessage>
                    <Button className="w-full" disabled={isLoading}>
                      {isLoading && <Loader2 className="animate-spin" />}
                      登入
                    </Button>
                  </form>
                </Form>
              )}

              <p
                className="text-[11px] text-muted-foreground/50 mt-10"
                onClick={(e) => { if (e.detail === 3) setAdminMode(true); }}
              >
                登入即同意<span className="underline underline-offset-2 cursor-pointer" onClick={() => setOpenTerm(true)}>服務條款</span>
              </p>
            </div>
          </div>
        </div>
      </div>
      <ServiceTermDialog open={openTerm} close={() => setOpenTerm(false)} />
    </>
  );
};

export default LoginPage;
