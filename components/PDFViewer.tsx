import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/utils/cn";

interface Props {
  className?: string;
  src: string;
}

const PDFViewer = ({ className, src }: Props) => (
  <AspectRatio ratio={1 / 1.41} className="my-2 border rounded-sm">
    <iframe src={src} title="pdf" className={cn("h-full", className)} />
  </AspectRatio>
);
export default PDFViewer;
