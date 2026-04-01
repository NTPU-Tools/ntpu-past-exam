import instance from "@/api-client/instance";
import { ModeToggle } from "@/components/DarkModeToggle";
import { MainNav } from "@/components/main-nav";
import { MobileNav } from "@/components/mobile-nav";
import { Button } from "@/components/ui/button";
import {
  Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator,
  MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarTrigger,
} from "@/components/ui/menubar";
import { useToast } from "@/components/ui/use-toast";
import userStore from "@/store/userStore";
import { eraseCookie, getCookie } from "@/utils/cookie";
import { isEmpty } from "lodash-es";
import { Plus, UserRound } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQueryState } from "@/hooks/useQueryState";
import useSWR from "swr";

function SiteHeader() {
  const { setUserData, userData } = userStore();
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const { setParams } = useQueryState();
  const isLoginPage = pathname === "/login";
  const accessToken = getCookie("ntpu-past-exam-access-token");
  const shouldFetch = accessToken && !isLoginPage;
  const { data, isLoading } = useSWR(
    shouldFetch ? `me` : null,
    () => instance.get("/users/me"),
    { refreshInterval: 1000 * 60 },
  );
  const { data: adminScopes } = useSWR(
    shouldFetch ? `departments-admin` : null,
    () => instance.get("/users/me/departments-admin"),
  );

  useEffect(() => {
    if (data) {
      setUserData(data);
      if (isEmpty(data?.school_department) || data?.school_department === " ") {
        toast({ title: "請點選右上方按鈕填寫個人資訊", variant: "default" });
      }
    }
  }, [setUserData, data]);

  const logout = () => {
    eraseCookie("ntpu-past-exam-access-token");
    eraseCookie("ntpu-past-exam-refresh-token");
    toast({ title: "已登出" });
    window.location.href = "/login";
  };

  const isAdmin = pathname.includes("admin");

  if (isLoading) {
    return (
      <header className="sticky h-12 top-0 z-50 w-full bg-header-bg border-b">
        <div className="h-full flex items-center justify-between px-4">
          <div className="animate-pulse bg-muted h-4 w-[100px]" />
          <div className="flex gap-1.5">
            <div className="animate-pulse bg-muted size-7 " />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-header-bg border-b">
      <div className="h-12 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <MainNav />
          {params.department_id && <MobileNav />}
        </div>

        <div className="flex items-center gap-1">
          <ModeToggle />
          {!isEmpty(userData) && (
            <>
              {isAdmin ? (
                <Link href="/"><Button variant="ghost" size="xs">回首頁</Button></Link>
              ) : (
                params.department_id && (
                  <Button size="xs" onClick={() => setParams({ open_create_post_dialog: "true" })}>
                    <Plus className="size-3" />
                    上傳
                  </Button>
                )
              )}
              <Menubar className="border-0 bg-transparent shadow-none p-0">
                <MenubarMenu>
                  <MenubarTrigger asChild>
                    <Button variant="ghost" size="icon-xs">
                      <UserRound className="size-3.5" />
                    </Button>
                  </MenubarTrigger>
                  <MenubarContent align="end">
                    <MenubarItem className="pointer-events-none font-semibold text-xs">
                      {userData?.readable_name ?? userData?.username}
                    </MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem onClick={() => setParams({ open_edit_user_info_dialog: "true" })}>
                      編輯個人資訊
                    </MenubarItem>
                    {adminScopes?.length > 0 && (
                      <>
                        <MenubarSeparator />
                        <MenubarSub>
                          <MenubarSubTrigger>管理後台</MenubarSubTrigger>
                          <MenubarSubContent>
                            {adminScopes?.map((scope: any) => (
                              <MenubarItem key={scope.id} onClick={() => router.push(`/admin/${scope.id}`)}>
                                {scope.name}
                              </MenubarItem>
                            ))}
                          </MenubarSubContent>
                        </MenubarSub>
                      </>
                    )}
                    <MenubarSeparator />
                    <MenubarItem onClick={logout}>登出</MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
              </Menubar>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default SiteHeader;
