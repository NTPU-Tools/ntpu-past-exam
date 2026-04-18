import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import globalUiStateStore from "@/store/globalUiStateStore"
import { cn } from "@/lib/utils"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
} from "@radix-ui/react-icons"
import { VisuallyHidden as VisuallyHiddenPrimitive } from "radix-ui"
const VisuallyHidden = VisuallyHiddenPrimitive.Root
import { Loader2 } from "lucide-react"
import { Fragment, useCallback, useEffect, useRef, useState } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"
import { useResizeObserver } from "usehooks-ts"

interface Props {
  className?: string
  src: string
}

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

const options = {
  cMapUrl: "/cmaps/",
  standardFontDataUrl: "/standard_fonts/",
}

const isTransientLoadError = (loadError: unknown) => {
  if (!(loadError instanceof Error)) return false

  // PDF.js UnexpectedResponseException with status 0 means the fetch was
  // cancelled at the network level (e.g. tab backgrounded on mobile).
  if ((loadError as { status?: number }).status === 0) return true

  const errorText = `${loadError.name} ${loadError.message}`.toLowerCase()

  return (
    errorText.includes("abort") ||
    errorText.includes("cancel") ||
    errorText.includes("interrupted") ||
    errorText.includes("failed to fetch") || // Chrome: fetch cancelled / network error
    errorText.includes("load failed") || // iOS Safari: generic network / CORS cache error
    errorText.includes("network error") || // Firefox: network-level failure
    errorText.includes("worker") // PDF.js worker destroyed after tab suspension / BFCache restore
  )
}

const defaultDownloadFilename = "past-exam.pdf"

const getFilenameFromContentDisposition = (contentDisposition: string | null) => {
  if (!contentDisposition) return null

  const utf8FilenameMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i)
  if (utf8FilenameMatch?.[1]) {
    const encodedFilename = utf8FilenameMatch[1].trim().replace(/^["']|["']$/g, "")

    try {
      return decodeURIComponent(encodedFilename)
    } catch {
      return encodedFilename
    }
  }

  const asciiFilenameMatch = contentDisposition.match(/filename="?([^";]+)"?/i)
  return asciiFilenameMatch?.[1]?.trim() ?? null
}

const getFilenameFromSrc = (fileUrl: string) => {
  try {
    const pathname = new URL(fileUrl, window.location.href).pathname
    const filename = pathname.split("/").pop()

    if (!filename) return defaultDownloadFilename

    const decodedFilename = decodeURIComponent(filename)
    return decodedFilename || defaultDownloadFilename
  } catch {
    return defaultDownloadFilename
  }
}

const PDFViewer = ({ className, src }: Props) => {
  const [pageNum, setPageNum] = useState(0)
  const [page, setPage] = useState(1)
  const [error, setError] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  // Tracks whether the PDF fetch was cancelled/aborted (e.g. tab backgrounded
  // on mobile) without setting the hard error flag.  Used to know we need to
  // force a retry when the user returns to the tab.
  const [loadAborted, setLoadAborted] = useState(false)
  // Incrementing this key forces <Document> to unmount+remount, which is
  // necessary when react-pdf is internally stuck after an aborted fetch (the
  // component never unmounted via the error-branch, so a key change is the
  // only way to make it restart the load).
  const [retryKey, setRetryKey] = useState(0)
  const { mainPanelWidth } = globalUiStateStore()
  const { toast } = useToast()

  const containerRef = useRef<HTMLDivElement>(null)
  const { width = 0 } = useResizeObserver({ ref: containerRef as any })
  // Set to true when the tab is hidden (e.g. user opens download in new tab).
  // Lets onDocumentLoadError treat any error as transient if it fires after a
  // backgrounding event — iOS/Android may delay JS until the tab is visible
  // again, so the error can arrive when visibilityState is already "visible"
  // and the visibilitychange handler has already run without seeing an error.
  const backgroundedRef = useRef(false)
  // Retry budget for errors that occur after a background/foreground cycle.
  // Set to MAX_BACKGROUND_RETRIES each time the tab is hidden; decremented on
  // each post-background error even after backgroundedRef is consumed so that
  // consecutive failures (e.g. retry also aborted) are also treated as transient.
  const backgroundedRetryCountRef = useRef(0)
  const MAX_BACKGROUND_RETRIES = 4

  useEffect(() => {
    setError(false)
    setLoadAborted(false)
    setPage(1)
    setPageNum(0)
  }, [src])

  // When the user returns to this tab (e.g. after opening the PDF in a new
  // tab), reset any error or aborted load so react-pdf can retry loading.
  // Also record when the tab is hidden so onDocumentLoadError can treat
  // post-background errors as transient even if they arrive after the tab
  // is visible again (iOS/Android delays JS until the tab resurfaces).
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        backgroundedRef.current = true
        backgroundedRetryCountRef.current = MAX_BACKGROUND_RETRIES
      } else if (document.visibilityState === "visible" && (error || loadAborted)) {
        setError(false)
        setLoadAborted(false)
        setPage(1)
        setRetryKey((k) => k + 1)
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [error, loadAborted])

  // Handle the race condition where onLoadError fires *after* the page has
  // already become visible again (e.g. the browser resumes JS and reports the
  // aborted fetch only after the visibilitychange event).  In that case the
  // visibilitychange handler ran while loadAborted was still false, so we need
  // to trigger the retry here instead.
  useEffect(() => {
    if (loadAborted && document.visibilityState === "visible") {
      setLoadAborted(false)
      setPage(1)
      setRetryKey((k) => k + 1)
    }
  }, [loadAborted])

  // When the browser restores this page from the Back/Forward Cache (BFCache),
  // visibilitychange may not fire.  Re-arm the backgrounded refs and force a
  // retry so any stale error or dead PDF.js worker is recovered from.
  useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      if (!e.persisted) return
      backgroundedRef.current = true
      backgroundedRetryCountRef.current = MAX_BACKGROUND_RETRIES
      setError(false)
      setLoadAborted(false)
      setPage(1)
      setRetryKey((k) => k + 1)
    }
    window.addEventListener("pageshow", handlePageShow)
    return () => window.removeEventListener("pageshow", handlePageShow)
  }, [])

  const onDocumentLoadSuccess = ({
    numPages: nextNumPages,
  }: {
    numPages: number
  }) => {
    backgroundedRef.current = false
    backgroundedRetryCountRef.current = 0
    setError(false)
    setLoadAborted(false)
    setPageNum(nextNumPages)
  }

  const onDocumentLoadError = (loadError: unknown) => {
    // Treat the error as transient if it looks like a network abort, if the tab
    // was backgrounded before the error arrived, OR if we still have retry budget
    // from a recent backgrounding event.  The budget covers consecutive failures
    // on retry (e.g. the retry fetch is also aborted, or a CORS-cache-poisoned
    // response is served) without letting a genuinely broken URL loop forever.
    const wasBackgrounded = backgroundedRef.current
    const hasBudget = backgroundedRetryCountRef.current > 0
    if (isTransientLoadError(loadError) || wasBackgrounded || hasBudget) {
      backgroundedRef.current = false
      if (hasBudget) backgroundedRetryCountRef.current--
      setLoadAborted(true)
      return
    }

    setError(true)
  }

  const handleDownload = useCallback(async () => {
    if (isDownloading) return

    setIsDownloading(true)

    try {
      const response = await fetch(src, {
        mode: "cors",
        credentials: "omit",
        cache: "reload",
      })

      if (!response.ok) {
        throw new Error(`Download failed with status ${response.status}`)
      }

      const blob = await response.blob()
      const contentDisposition = response.headers.get("content-disposition")
      const filename =
        getFilenameFromContentDisposition(contentDisposition) ??
        getFilenameFromSrc(src)

      const objectUrl = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = objectUrl
      link.download = filename
      link.rel = "noreferrer"

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)

      if (error) {
        setError(false)
        setLoadAborted(false)
        setPage(1)
        setRetryKey((k) => k + 1)
      }
    } catch (downloadError) {
      console.error("Failed to download PDF file", downloadError)
      toast({ title: "下載失敗", variant: "error" })
    } finally {
      setIsDownloading(false)
    }
  }, [error, isDownloading, src, toast])

  return (
    <AspectRatio
      ratio={1 / 1.4142}
      className="my-2 overflow-hidden border"
      ref={containerRef}
    >
      {/* Outer wrapper is the hover group so the download button (always
          rendered below) can participate in the same group-hover logic. */}
      <div className="group relative h-full w-full">
        {!error ? (
          <Document
            key={retryKey}
            file={src}
            options={options}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={() => (
              <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}
            className="relative max-h-full max-w-full overflow-hidden"
          >
            <AspectRatio ratio={1 / 1.4142}>
              <Fragment key={`${width}-${mainPanelWidth}`}>
                <Page
                  pageNumber={page}
                  loading={() => (
                    <div className="flex h-full w-full items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  )}
                  className="h-full w-full"
                  width={width}
                />
              </Fragment>
            </AspectRatio>
          </Document>
        ) : (
          <iframe
            src={src}
            title="past-exam-file"
            className={cn("h-full w-full", className)}
          />
        )}

        {/* Pagination controls — rendered outside Document so they are never
            hidden by react-pdf's internal loading state. */}
        {!error && pageNum > 0 && (
          <div className="absolute top-2 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 bg-background/80 p-1 opacity-100 backdrop-blur-md transition-opacity duration-300 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100">
            <Button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              variant="outline"
              size="icon"
            >
              <ChevronLeftIcon />
            </Button>
            <span className="px-1 text-xs text-muted-foreground tabular-nums">
              {page} / {pageNum}
            </span>
            <Button
              onClick={() => setPage(page + 1)}
              disabled={page === pageNum}
              variant="outline"
              size="icon"
            >
              <ChevronRightIcon />
            </Button>
          </div>
        )}

        {/* Download button — rendered outside the error conditional so it is
            always visible even when react-pdf falls back to the iframe. */}
        <div className="absolute top-2 right-2 z-10 bg-background/80 p-1 opacity-100 backdrop-blur-md transition-opacity duration-300 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handleDownload}
                disabled={isDownloading}
                className={cn(
                  "inline-flex size-8 shrink-0 items-center justify-center rounded-none border border-border bg-background text-foreground transition-all hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                )}
              >
                <VisuallyHidden>{isDownloading ? "下載中" : "下載檔案"}</VisuallyHidden>
                {isDownloading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <DownloadIcon className="size-4" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>{isDownloading ? "下載中..." : "下載檔案"}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </AspectRatio>
  )
}
export default PDFViewer
