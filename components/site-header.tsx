import instance from "@/api-client/instance";
import { ModeToggle } from "@/components/DarkModeToggle";
import { MainNav } from "@/components/main-nav";
import { MobileNav } from "@/components/mobile-nav";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator,
  MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarTrigger,
} from "@/components/ui/menubar";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import userStore from "@/store/userStore";
import { eraseCookie, getCookie } from "@/utils/cookie";
import { isEmpty } from "lodash-es";
import { Loader2, Plus, SlidersHorizontal, UserRound } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQueryState } from "@/hooks/useQueryState";
import { swrKeys } from "@/lib/swr-keys";
import useSWR, { mutate } from "swr";

function SiteHeader() {
  const { setUserData, userData } = userStore();
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const { setParams } = useQueryState();
  const [preferenceOpen, setPreferenceOpen] = useState(false);
  const [draftShowEmpty, setDraftShowEmpty] = useState(true);
  const [prefSaving, setPrefSaving] = useState(false);
  const isLoginPage = pathname === "/login";
  const accessToken = getCookie("ntpu-past-exam-access-token");
  const shouldFetch = accessToken && !isLoginPage;
  const { data, isLoading } = useSWR(
    shouldFetch ? swrKeys.userMe() : null,
    () => instance.get("/users/me"),
    { refreshInterval: 1000 * 60 },
  );
  const { data: adminScopes } = useSWR(
    shouldFetch ? swrKeys.adminDepartments() : null,
    () => instance.get("/users/me/departments-admin"),
  );

  useEffect(() => {
    if (data) {
      setUserData(data);
      if (isEmpty(data?.school_department) || data?.school_department === " ") {
        toast({ title: "請點選右上方按鈕填寫個人資訊", variant: "default" });
      }
    }
  }, [setUserData, data, toast]);

  const logout = () => {
    eraseCookie("ntpu-past-exam-access-token");
    eraseCookie("ntpu-past-exam-refresh-token");
    toast({ title: "已登出" });
    window.location.href = "/login";
  };

  const openPreferenceDialog = () => {
    setDraftShowEmpty(userData?.show_empty_courses ?? true);
    setPreferenceOpen(true);
  };

  const savePreferences = async () => {
    try {
      setPrefSaving(true);
      const result = await instance.put("/users/me/preferences", {
        show_empty_courses: draftShowEmpty,
      });
      const updated = { ...userData, show_empty_courses: result.show_empty_courses };
      setUserData(updated);
      mutate(swrKeys.userMe(), updated, false);
      setPreferenceOpen(false);
      toast({ title: "設定已儲存" });
    } catch {
      toast({ title: "設定儲存失敗", variant: "error" });
    } finally {
      setPrefSaving(false);
    }
  };

  const isAdmin = pathname.includes("admin");

  if (isLoading) {
    return (
      // [R2-2]
      <header className="sticky h-12 top-0 z-50 w-full bg-header-bg border-b" style={{ ["--header-height" as string]: "3rem" }}>
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
    // [R2-2]
    <>
      <header className="sticky top-0 z-50 w-full bg-header-bg border-b" style={{ ["--header-height" as string]: "3rem" }}>
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
                {params.department_id && (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={openPreferenceDialog}
                    aria-label="偏好設定"
                  >
                    <SlidersHorizontal className="size-3.5" />
                  </Button>
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

      <Dialog open={preferenceOpen} onOpenChange={setPreferenceOpen}>
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle>偏好設定</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm">顯示沒有考古題的課程</span>
            <Switch
              checked={draftShowEmpty}
              onCheckedChange={setDraftShowEmpty}
              size="sm"
              disabled={prefSaving}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={prefSaving}>取消</Button>
            </DialogClose>
            <Button onClick={savePreferences} disabled={prefSaving}>
              {prefSaving ? <Loader2 className="animate-spin size-4 mr-1" /> : null}
              儲存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default SiteHeader;
