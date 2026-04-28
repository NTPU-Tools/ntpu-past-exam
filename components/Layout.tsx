"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { ResizableSplit } from "@/components/ResizableSplit";
import SidebarNav from "@/components/sidebar-nav";
import SiteFooter from "@/components/site-footer";
import dynamic from "next/dynamic"; // [R2-4]
import { usePathname } from "next/navigation";
import { FC, ReactNode } from "react";
import { useMediaQuery, useLocalStorage } from "usehooks-ts";

interface PageProps { // [R1-4]
  children: ReactNode;
}

const TailwindIndicator = dynamic(
  () => import("@/components/TailwindIndicator"),
  { ssr: false },
);
const TailwindIndicatorDynamic =
  process.env.NODE_ENV === "production" ? () => null : TailwindIndicator;
const SiteHeader = dynamic(() => import("@/components/site-header"), {
  // [R1-2] Client-only: uses client-side auth/navigation hooks
  ssr: false,
  loading: () => (
    <header className="sticky h-12 top-0 z-50 w-full bg-header-bg border-b">
      <div className="h-full flex items-center justify-between px-4">
        <div className="animate-pulse bg-muted h-4 w-[100px]" />
        <div className="flex gap-1.5">
          <div className="animate-pulse bg-muted size-7" />
        </div>
      </div>
    </header>
  ),
});

const Layout: FC<PageProps> = ({ children }) => { // [R2-4]
  const pathname = usePathname();
  const isDesktop = useMediaQuery("(min-width: 768px)", { defaultValue: true });

  const isSimplePage =
    pathname === "/login" || pathname === "/" || pathname.startsWith("/admin"); // [R1-1]

  const [sidebarRatio, setSidebarRatio] = useLocalStorage("ntpu-sidebar-ratio", 0.17);

  if (isSimplePage) {
    const needsContainer = pathname.startsWith("/admin"); // [R2-3]
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

  if (!isDesktop) {
    return (
      <div className="relative flex min-h-screen flex-col">
        <SiteHeader />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 py-8 px-6">
            {children}
          </main>
          <SiteFooter />
        </div>
        <TailwindIndicatorDynamic />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteHeader />
      <ResizableSplit
        direction="horizontal"
        defaultRatio={sidebarRatio}
        minRatio={0.08}
        maxRatio={0.45}
        className="flex-1"
        onRatioChange={setSidebarRatio}
      >
        <aside className="flex flex-col sticky top-[var(--header-height)] z-30 w-full shrink-0 h-[calc(100dvh-var(--header-height))] border-r bg-sidebar-bg/60">
          <ScrollArea className="flex-1 min-h-0 py-4 px-3">
            <SidebarNav />
          </ScrollArea>
        </aside>
        <div className="flex-1 min-w-0 flex flex-col">
          <main className="flex-1 py-8 lg:py-10 px-6 md:px-10">
            {children}
          </main>
          <SiteFooter />
        </div>
      </ResizableSplit>
      <TailwindIndicatorDynamic />
    </div>
  );
};

export default Layout;
