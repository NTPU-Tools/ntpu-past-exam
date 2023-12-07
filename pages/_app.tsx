import "../styles/globals.css";
import Layout from "@/components/Layout";
import type { AppProps } from "next/app";
import Dynamic from "next/dynamic";
import Head from "next/head";

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
    <TooltipProvider delayDuration={200}>
      <Layout>
        <Component {...pageProps} />
        <Head>
          <title>
            {(Component as unknown as { title: string }).title} - NPTU 考古題
          </title>
        </Head>
      </Layout>
      <Toaster />
      <Dialogs />
      <Analytics />
    </TooltipProvider>
  );
}
