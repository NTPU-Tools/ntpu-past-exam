import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import globalUiStateStore from "@/store/globalUiStateStore";
import { cn } from "@/lib/utils";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
} from "@radix-ui/react-icons";
import { VisuallyHidden as VisuallyHiddenPrimitive } from "radix-ui";
const VisuallyHidden = VisuallyHiddenPrimitive.Root;
import { Loader2 } from "lucide-react";
import { Fragment, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useResizeObserver } from "usehooks-ts";

interface Props {
  className?: string;
  src: string;
}

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const options = {
  cMapUrl: "/cmaps/",
  standardFontDataUrl: "/standard_fonts/",
};

const PDFViewer = ({ className, src }: Props) => {
  const [pageNum, setPageNum] = useState(0);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(false);
  const { mainPanelWidth } = globalUiStateStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const { width = 0 } = useResizeObserver({ ref: containerRef as any });

  const onDocumentLoadSuccess = ({ numPages: nextNumPages }: { numPages: number }) => {
    setPageNum(nextNumPages);
  };

  return (
    <AspectRatio
      ratio={1 / 1.4142}
      className="my-2 border overflow-hidden"
      ref={containerRef}
    >
      {!error ? (
        <Document
          file={src}
          options={options}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={() => setError(true)}
          loading={() => (
            <div className="w-full h-full flex justify-center items-center">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          )}
          className="max-h-full max-w-full relative overflow-hidden group"
        >
          <AspectRatio ratio={1 / 1.4142}>
            <Fragment key={`${width}-${mainPanelWidth}`}>
              <Page
                pageNumber={page}
                loading={() => (
                  <div className="w-full h-full flex justify-center items-center">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                )}
                className="h-full w-full"
                width={width}
              />
            </Fragment>
          </AspectRatio>
          {/* Top navigation controls */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-background/80 backdrop-blur-md p-1 transition-opacity duration-300 opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 z-10">
            <Button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              variant="outline"
              size="icon"
            >
              <ChevronLeftIcon />
            </Button>
            <span className="text-xs text-muted-foreground tabular-nums px-1">
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
          {/* Download button */}
          <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-md p-1 transition-opacity duration-300 opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 z-10">
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href={src}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    "group/button inline-flex shrink-0 items-center justify-center rounded-none border border-border bg-background text-foreground size-8 hover:bg-muted transition-all",
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
        </Document>
      ) : (
        <iframe
          src={src}
          title="past-exam-file"
          className={cn("h-full", className)}
        />
      )}
    </AspectRatio>
  );
};
export default PDFViewer;
