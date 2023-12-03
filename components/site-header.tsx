import instance from "@/api/instance";
import { ModeToggle } from "@/components/DarkModeToggle";
import { MainNav } from "@/components/main-nav";
import { MobileNav } from "@/components/mobile-nav";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { eraseCookie, getCookie } from "@/utils/cookie";
import { UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import useSWRImmutable from "swr/immutable";

export function SiteHeader() {
  const { toast } = useToast();
  const router = useRouter();
  const query = router.query;
  const accessToken = getCookie("ntpu-past-exam-access-token");
  const { data } = useSWRImmutable(
    accessToken ? `me-${accessToken}` : null,
    () => instance.get("/users/me"),
  );
  const userData = data?.data;

  const logout = () => {
    eraseCookie("ntpu-past-exam-access-token");
    eraseCookie("ntpu-past-exam-refresh-token");
    toast({
      title: "登出成功",
    });
    window.location.href = "/login";
  };

  const isAdmin = router.pathname.includes("admin");

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <MainNav />
        <MobileNav />
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
                  <Button
                    onClick={() => {
                      router.replace(
                        { query: { ...query, openCreatePostDialog: "true" } },
                        undefined,
                        { shallow: true },
                      );
                    }}
                  >
                    上傳考古題
                  </Button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Avatar>
                      <AvatarFallback>
                        <UserRound />
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[300px]">
                    <DropdownMenuLabel>
                      Hi, {userData?.username}
                    </DropdownMenuLabel>
                    {userData?.is_admin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            router.push("/admin");
                          }}
                        >
                          管理後台
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>登出</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
