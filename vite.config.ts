import path from "node:path"
import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "NEXT_PUBLIC_")
  const clientEnv = {
    NODE_ENV: mode,
    NEXT_PUBLIC_API_ORIGIN: env.NEXT_PUBLIC_API_ORIGIN,
    NEXT_PUBLIC_GOOGLE_LOGIN_CLIENT_ID: env.NEXT_PUBLIC_GOOGLE_LOGIN_CLIENT_ID,
    NEXT_PUBLIC_GA_MEASUREMENT_ID: env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    NEXT_PUBLIC_CLARITY_MEASUREMENT_ID: env.NEXT_PUBLIC_CLARITY_MEASUREMENT_ID,
    NEXT_PUBLIC_CLOUDFLARE_MEASUREMENT_ID:
      env.NEXT_PUBLIC_CLOUDFLARE_MEASUREMENT_ID,
    NEXT_PUBLIC_GIT_BRANCH: env.NEXT_PUBLIC_GIT_BRANCH,
  }

  return {
    plugins: [react()],
    resolve: {
      alias: [
        { find: "@", replacement: path.resolve(__dirname, ".") },
        {
          find: "next/font/google",
          replacement: path.resolve(__dirname, "src/next/font/google.ts"),
        },
        {
          find: "next/navigation",
          replacement: path.resolve(__dirname, "src/next/navigation.ts"),
        },
        {
          find: "next/dynamic",
          replacement: path.resolve(__dirname, "src/next/dynamic.tsx"),
        },
        {
          find: "next/script",
          replacement: path.resolve(__dirname, "src/next/script.tsx"),
        },
        {
          find: "next/link",
          replacement: path.resolve(__dirname, "src/next/link.tsx"),
        },
        {
          find: "next",
          replacement: path.resolve(__dirname, "src/next/index.ts"),
        },
        {
          find: "canvas",
          replacement: path.resolve(__dirname, "empty-module.js"),
        },
      ],
    },
    define: {
      "process.env": JSON.stringify(clientEnv),
    },
  }
})
