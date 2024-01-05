import "../styles/globals.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import type { AppProps } from "next/app";
import Dynamic from "next/dynamic";
import Head from "next/head";
import { SWRConfig } from "swr";

const Layout = Dynamic(() => import("@/components/Layout"), {
  ssr: false,
});
const Dialogs = Dynamic(() => import("@/containers/Dialogs"), {
  ssr: false,
});
const Toaster = Dynamic(() => import("@/components/ui/toaster"), {
  ssr: false,
});
const Analytics = Dynamic(() => import("@/components/analytics"), {
  ssr: false,
});
const TooltipProvider = Dynamic(() => import("@/components/ui/tooltip"), {
  ssr: false,
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SWRConfig
      value={{
        errorRetryInterval: 500,
        errorRetryCount: 5,
      }}
    >
      <GoogleOAuthProvider
        clientId={process.env.NEXT_PUBLIC_GOOGLE_LOGIN_CLIENT_ID as string}
      >
        <TooltipProvider delayDuration={200}>
          <Layout>
            <Component {...pageProps} />
            {(Component as unknown as { title: string }).title && (
              <Head>
                <title>
                  {(Component as unknown as { title: string }).title} - NTPU
                  考古題
                </title>
              </Head>
            )}
          </Layout>
          <Toaster />
          <Dialogs />
          <Analytics />
        </TooltipProvider>
      </GoogleOAuthProvider>
    </SWRConfig>
  );
}
