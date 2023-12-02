import { TailwindIndicator } from "@/components/TailwindIndicator";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SidebarNav } from "@/components/sidebar-nav";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePathname } from "next/navigation";
import { FC, ReactNode } from "react";

interface pageProps {
  children: ReactNode;
}

const Layout: FC<pageProps> = ({ children }: pageProps) => {
  const pathname = usePathname();

  if (pathname === "/login") {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="relative flex min-h-screen flex-col">
          <SiteHeader />
          <div className="flex-1">
            <div className="border-b">{children}</div>
          </div>
          <SiteFooter />
        </div>
        <TailwindIndicator />
      </ThemeProvider>
    );
  }
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="relative flex min-h-screen flex-col">
        <SiteHeader />
        <div className="flex-1">
          <div className="border-b">
            <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
              <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-4rem)] w-full shrink-0 md:sticky md:block">
                <ScrollArea className="h-full py-6 pl-8 pr-6 lg:py-8">
                  <SidebarNav />
                </ScrollArea>
              </aside>
              <main className="relative py-6 lg:gap-10 lg:py-8  min-h-[calc(100vh-4rem)] h-[1px]">
                {children}
              </main>
            </div>
          </div>
        </div>
        <SiteFooter />
      </div>
      <TailwindIndicator />
    </ThemeProvider>
  );
};

export default Layout;
