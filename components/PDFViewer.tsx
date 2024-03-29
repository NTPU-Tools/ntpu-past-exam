import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import globalUiStateStore from "@/store/globalUiStateStore";
import { cn } from "@/utils/cn";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
} from "@radix-ui/react-icons";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Loader2 } from "lucide-react";
import { Fragment, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useElementSize } from "usehooks-ts";

interface Props {
  className?: string;
  src: string;
}

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url,
).toString();

const options = {
  cMapUrl: "/cmaps/",
  standardFontDataUrl: "/standard_fonts/",
};

const PDFViewer = ({ className, src }: Props) => {
  const [pageNum, setPageNum] = useState(0);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(false);
  const { mainPanelWidth } = globalUiStateStore();

  const [containerRef, { width }] = useElementSize();

  const onDocumentLoadSuccess = ({ numPages: nextNumPages }) => {
    setPageNum(nextNumPages);
  };

  return (
    <AspectRatio
      ratio={1 / 1.4142}
      className="my-2 border rounded-sm overflow-hidden"
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
          className="max-h-full max-w-full relative overflow-hidden"
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
          <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-2 opacity-30 hover:opacity-100 z-50">
            <Button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              variant="outline"
              size="icon"
              className="disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeftIcon />
            </Button>
            <Button
              onClick={() => setPage(page + 1)}
              disabled={page === pageNum}
              variant="outline"
              size="icon"
              className="disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRightIcon />
            </Button>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="absolute top-0 right-0 m-2 opacity-50 hover:opacity-100 z-50"
          >
            <a
              href={src}
              download
              target="_blank"
              rel="noreferrer"
              className="h-full w-full flex justify-center items-center"
            >
              <VisuallyHidden>下載檔案</VisuallyHidden>
              <DownloadIcon />
            </a>
          </Button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 opacity-30 hover:opacity-100 z-50">
            <Button
              size="icon"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              variant="outline"
              className="disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeftIcon />
            </Button>
            <Button
              size="icon"
              onClick={() => setPage(page + 1)}
              disabled={page === pageNum}
              variant="outline"
              className="disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRightIcon />
            </Button>
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
