import { ThemeProvider } from "@/components/ThemeProvider";
import Dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { FC, ReactNode } from "react";

interface pageProps {
  children: ReactNode;
}

const TailwindIndicator = Dynamic(
  () => import("@/components/TailwindIndicator"),
  {
    ssr: false,
  },
);
const TailwindIndicatorDynamic =
  process.env.NODE_ENV === "production" ? () => null : TailwindIndicator;
const ScrollArea = Dynamic(() => import("@/components/ui/scroll-area"), {
  ssr: false,
});
const SiteHeader = Dynamic(() => import("@/components/site-header"), {
  ssr: false,
  loading: () => (
    <header className="sticky h-16 top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center space-x-4 justify-between sm:space-x-0">
        <div className="animate-pulse rounded-md bg-muted h-10 w-10 md:w-[150px]" />
        <div className="flex gap-2">
          <div className="animate-pulse bg-muted h-10 w-10 rounded-md" />
          <div className="animate-pulse bg-muted h-10 w-[102px] rounded-md" />
          <div className="animate-pulse bg-muted h-10 w-10 rounded-full" />
        </div>
      </div>
    </header>
  ),
});
const SidebarNav = Dynamic(() => import("@/components/sidebar-nav"), {
  ssr: false,
  loading: () => (
    <div className="w-full flex-col flex gap-4">
      <div className="animate-pulse rounded-md bg-muted h-4 w-[150px]" />
      <div className="animate-pulse rounded-md bg-muted h-4 w-[100px]" />
      <div className="animate-pulse rounded-md bg-muted h-4 w-[100px]" />
      <div className="animate-pulse rounded-md bg-muted h-4 w-[150px]" />
      <div className="animate-pulse rounded-md bg-muted h-4 w-[100px]" />
      <div className="animate-pulse rounded-md bg-muted h-4 w-[80px]" />
      <div className="animate-pulse rounded-md bg-muted h-4 w-[120px]" />
      <div className="animate-pulse rounded-md bg-muted h-4 w-[150px]" />
      <div className="animate-pulse rounded-md bg-muted h-4 w-[60px]" />
      <div className="animate-pulse rounded-md bg-muted h-4 w-[100px]" />
      <div className="animate-pulse rounded-md bg-muted h-4 w-[70px]" />
      <div className="animate-pulse rounded-md bg-muted h-4 w-[150px]" />
      <div className="animate-pulse rounded-md bg-muted h-4 w-[100px]" />
      <div className="animate-pulse rounded-md bg-muted h-4 w-[100px]" />
      <div className="animate-pulse rounded-md bg-muted h-4 w-[150px]" />
      <div className="animate-pulse rounded-md bg-muted h-4 w-[100px]" />
      <div className="animate-pulse rounded-md bg-muted h-4 w-[80px]" />
      <div className="animate-pulse rounded-md bg-muted h-4 w-[120px]" />
      <div className="animate-pulse rounded-md bg-muted h-4 w-[150px]" />
      <div className="animate-pulse rounded-md bg-muted h-4 w-[60px]" />
      <div className="animate-pulse rounded-md bg-muted h-4 w-[100px]" />
      <div className="animate-pulse rounded-md bg-muted h-4 w-[70px]" />
    </div>
  ),
});
const SiteFooter = Dynamic(() => import("@/components/site-footer"), {
  ssr: false,
});
const Layout: FC<pageProps> = ({ children }: pageProps) => {
  const { pathname } = useRouter();

  if (pathname === "/login" || pathname === "/inactive") {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="relative flex min-h-screen flex-col">
          <SiteHeader />
          <div className="flex-1">
            <div className="border-b">{children}</div>
          </div>
          <SiteFooter />
        </div>
        <TailwindIndicatorDynamic />
      </ThemeProvider>
    );
  }
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="relative flex min-h-screen flex-col">
        <SiteHeader />
        <div className="flex-1">
          <div className="border-b">
            <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)_120px] lg:gap-10">
              <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-4rem)] w-full shrink-0 md:sticky md:block">
                <ScrollArea className="h-full py-6 pl-8 pr-6 lg:py-8">
                  <SidebarNav />
                </ScrollArea>
              </aside>
              <main className="relative py-6 lg:gap-10 lg:py-8  min-h-[calc(100vh-4rem)]">
                {children}
              </main>
            </div>
          </div>
        </div>
        <SiteFooter />
      </div>
      <TailwindIndicatorDynamic />
    </ThemeProvider>
  );
};

export default Layout;
