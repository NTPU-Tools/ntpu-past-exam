"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import SidebarNav from "@/components/sidebar-nav";
import SiteFooter from "@/components/site-footer";
import Dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { FC, ReactNode } from "react";

interface pageProps {
  children: ReactNode;
}

const TailwindIndicator = Dynamic(
  () => import("@/components/TailwindIndicator"),
  { ssr: false },
);
const TailwindIndicatorDynamic =
  process.env.NODE_ENV === "production" ? () => null : TailwindIndicator;
const SiteHeader = Dynamic(() => import("@/components/site-header"), {
  ssr: false,
  loading: () => (
    <header className="sticky h-12 top-0 z-50 w-full bg-header-bg border-b">
      <div className="h-full flex items-center justify-between px-4">
        <div className="animate-pulse bg-muted h-4 w-[100px]" />
        <div className="flex gap-1.5">
          <div className="animate-pulse bg-muted size-7 " />
        </div>
      </div>
    </header>
  ),
});

const Layout: FC<pageProps> = ({ children }: pageProps) => {
  const pathname = usePathname();

  const isSimplePage =
    pathname === "/login" || pathname === "/" || pathname.includes("/admin");

  if (isSimplePage) {
    const needsContainer = pathname.includes("/admin");
    return (
      <div className="relative flex min-h-screen flex-col">
        <SiteHeader />
        <div className="flex-1">
          {needsContainer ? (
            <div className="max-w-4xl mx-auto px-6 py-10">{children}</div>
          ) : (
            children
          )}
        </div>
        <SiteFooter />
        <TailwindIndicatorDynamic />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteHeader />
      <div className="flex-1 flex">
        <aside className="hidden md:flex flex-col sticky top-12 z-30 w-[220px] lg:w-[240px] shrink-0 h-[calc(100dvh-3rem)] border-r">
          <ScrollArea className="flex-1 py-4 px-3">
            <SidebarNav />
          </ScrollArea>
        </aside>
        <div className="flex-1 min-w-0 flex flex-col">
          <main className="flex-1 max-w-3xl py-8 lg:py-10 px-6 md:px-10">
            {children}
          </main>
          <SiteFooter />
        </div>
      </div>
      <TailwindIndicatorDynamic />
    </div>
  );
};

export default Layout;
