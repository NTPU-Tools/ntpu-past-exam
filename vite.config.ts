import path from "node:path"
import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")

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
        { find: "next/link", replacement: path.resolve(__dirname, "src/next/link.tsx") },
        { find: "next", replacement: path.resolve(__dirname, "src/next/index.ts") },
        { find: "canvas", replacement: path.resolve(__dirname, "empty-module.js") },
      ],
    },
    define: {
      "process.env": JSON.stringify({
        ...env,
        NODE_ENV: mode,
      }),
    },
  }
})
