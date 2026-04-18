import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Button } from "@/components/ui/button"
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
import { Fragment, useEffect, useRef, useState } from "react"
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
    errorText.includes("failed to fetch") // Chrome: fetch cancelled / network error
  )
}

const PDFViewer = ({ className, src }: Props) => {
  const [pageNum, setPageNum] = useState(0)
  const [page, setPage] = useState(1)
  const [error, setError] = useState(false)
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

  const containerRef = useRef<HTMLDivElement>(null)
  const { width = 0 } = useResizeObserver({ ref: containerRef as any })
  // Set to true when the tab is hidden (e.g. user opens download in new tab).
  // Lets onDocumentLoadError treat any error as transient if it fires after a
  // backgrounding event — iOS/Android may delay JS until the tab is visible
  // again, so the error can arrive when visibilityState is already "visible"
  // and the visibilitychange handler has already run without seeing an error.
  const backgroundedRef = useRef(false)

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

  const onDocumentLoadSuccess = ({
    numPages: nextNumPages,
  }: {
    numPages: number
  }) => {
    backgroundedRef.current = false
    setError(false)
    setLoadAborted(false)
    setPageNum(nextNumPages)
  }

  const onDocumentLoadError = (loadError: unknown) => {
    // Treat the error as transient if it looks like a network abort OR if the
    // tab was backgrounded before the error arrived.  The latter handles the
    // iOS/Android race where JS resumes only after the tab is visible again,
    // so the error fires when visibilityState is already "visible" and the
    // visibilitychange handler has already run without triggering a retry.
    // Clear backgroundedRef after consuming it so a second consecutive failure
    // is judged on its own merits.
    const wasBackgrounded = backgroundedRef.current
    if (isTransientLoadError(loadError) || wasBackgrounded) {
      backgroundedRef.current = false
      setLoadAborted(true)
      return
    }

    setError(true)
  }

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
              <a
                href={src}
                download
                target="_blank"
                rel="noreferrer"
                className={cn(
                  "inline-flex size-8 shrink-0 items-center justify-center rounded-none border border-border bg-background text-foreground transition-all hover:bg-muted"
                )}
              >
                <VisuallyHidden>下載檔案</VisuallyHidden>
                <DownloadIcon className="size-4" />
              </a>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>下載檔案</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </AspectRatio>
  )
}
export default PDFViewer
