import instance from "@/api/instance";
import { ModeToggle } from "@/components/DarkModeToggle";
import { MainNav } from "@/components/main-nav";
import { MobileNav } from "@/components/mobile-nav";
import { Button } from "@/components/ui/button";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { useToast } from "@/components/ui/use-toast";
import userStore from "@/store/userStore";
import { eraseCookie, getCookie } from "@/utils/cookie";
import { UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import useSWR from "swr";

function SiteHeader() {
  const { setUserData, userData } = userStore();
  const { toast } = useToast();
  const router = useRouter();
  const query = router.query;
  const accessToken = getCookie("ntpu-past-exam-access-token");
  const { data, isLoading } = useSWR(
    accessToken ? `me-${accessToken}` : null,
    () => instance.get("/users/me"),
    {
      refreshInterval: 1000 * 60,
    },
  );

  const { data: adminScopes } = useSWR(
    userData?.is_active ? `departments-admin` : null,
    () => instance.get("/users/me/departments-admin"),
  );

  useEffect(() => {
    setUserData(data);
    if (data?.is_active && router.pathname === "/inactive") {
      router.replace("/");
    }
  }, [setUserData, data, router]);

  const logout = () => {
    eraseCookie("ntpu-past-exam-access-token");
    eraseCookie("ntpu-past-exam-refresh-token");
    toast({
      title: "登出成功",
    });
    window.location.href = "/login";
  };

  const isAdmin = router.pathname.includes("admin");

  if (isLoading) {
    return (
      <header className="sticky h-16 top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center space-x-4 justify-between sm:space-x-0">
          <div className="animate-pulse rounded-md bg-muted h-10 w-10 md:w-[150px]" />
          <div className="flex gap-2">
            <div className="animate-pulse bg-muted h-10 w-10 rounded-md" />
            <div className="animate-pulse bg-muted h-10 w-[102px] rounded-md" />
            <div className="animate-pulse bg-muted h-10 w-[58px] rounded-md" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <MainNav />
        {query.department_id && <MobileNav />}

        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <ModeToggle />
            {userData && (
              <>
                {isAdmin ? (
                  <Link href="/">
                    <Button variant="outline">回首頁</Button>
                  </Link>
                ) : (
                  userData?.is_active &&
                  query.department_id && (
                    <Button
                      onClick={() => {
                        router.replace(
                          {
                            query: {
                              ...query,
                              open_create_post_dialog: "true",
                            },
                          },
                          undefined,
                          { shallow: true },
                        );
                      }}
                    >
                      上傳考古題
                    </Button>
                  )
                )}

                <Menubar>
                  <MenubarMenu>
                    <MenubarTrigger asChild>
                      <div className="w-full h-full cursor-pointer">
                        <UserRound />
                      </div>
                    </MenubarTrigger>

                    <MenubarContent>
                      <MenubarItem>
                        Hi, {userData?.readable_name ?? userData?.username}
                      </MenubarItem>
                      {adminScopes?.length > 0 && (
                        <>
                          <MenubarSeparator />
                          <MenubarSub
                          // onClick={() => {
                          //   router.push("/admin");
                          // }}
                          >
                            <MenubarSubTrigger>管理後台</MenubarSubTrigger>
                            <MenubarSubContent>
                              {adminScopes?.length
                                ? adminScopes?.map((scope: any) => (
                                    <MenubarItem
                                      key={scope.id}
                                      onClick={() => {
                                        router.push(`/admin/${scope.id}`);
                                      }}
                                    >
                                      {scope.name}
                                    </MenubarItem>
                                  ))
                                : null}
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
          </nav>
        </div>
      </div>
    </header>
  );
}

export default SiteHeader;
