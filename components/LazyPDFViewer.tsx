import type { PDFViewerProps } from "@/components/PDFViewer"
import { cn } from "@/lib/utils"
import { lazy, Suspense } from "react"

const PDFViewer = lazy(() => import("@/components/PDFViewer"))

const LazyPDFViewer = ({ className, ...props }: PDFViewerProps) => (
  <Suspense
    fallback={
      <div
        aria-busy="true"
        aria-label="正在載入 PDF 預覽"
        className={cn("my-2 animate-pulse border bg-muted", className)}
        style={{ aspectRatio: 1 / 1.4142 }}
      />
    }
  >
    <PDFViewer className={className} {...props} />
  </Suspense>
)

export default LazyPDFViewer
