"use client";

import "@/utils/polyfills";
import dynamic from "next/dynamic";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Suspense } from "react";
import { SWRConfig } from "swr";
import { ThemeProvider } from "@/components/theme-provider";

const Layout = dynamic(() => import("@/components/Layout"), { ssr: false });
const Dialogs = dynamic(() => import("@/containers/Dialogs"), { ssr: false });
const Toaster = dynamic(() => import("@/components/ui/toaster"), {
  ssr: false,
});
const Analytics = dynamic(() => import("@/components/analytics"), {
  ssr: false,
});
const TooltipProvider = dynamic(
  () =>
    import("@/components/ui/tooltip").then((mod) => mod.TooltipProvider),
  { ssr: false },
);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SWRConfig
        value={{
          errorRetryInterval: 500,
          errorRetryCount: 5,
        }}
      >
        <GoogleOAuthProvider
          clientId={process.env.NEXT_PUBLIC_GOOGLE_LOGIN_CLIENT_ID as string}
        >
          <Suspense>
            <TooltipProvider delayDuration={200}>
              <Layout>{children}</Layout>
              <Toaster />
              <Dialogs />
              <Analytics />
            </TooltipProvider>
          </Suspense>
        </GoogleOAuthProvider>
      </SWRConfig>
    </ThemeProvider>
  );
}
