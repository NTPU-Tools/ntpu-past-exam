import "../styles/globals.css";
import Layout from "@/components/Layout";
import { Analytics } from "@/components/analytics";
import { Toaster } from "@/components/ui/toaster";
import Dialogs from "@/containers/Dialogs";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Layout>
        <Component {...pageProps} />
      </Layout>
      <Toaster />
      <Dialogs />
      <Analytics />
    </>
  );
}
