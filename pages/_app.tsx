import "../styles/globals.css";
import Layout from "@/components/Layout";
import type { AppProps } from "next/app";
import Dynamic from "next/dynamic";

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
      </Layout>
      <Toaster />
      <Dialogs />
      <Analytics />
    </TooltipProvider>
  );
}
