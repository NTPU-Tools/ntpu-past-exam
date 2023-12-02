interface Props {
  className?: string;
  src: string;
}

const PDFViewer = ({ className, src }: Props) => (
  <iframe src={src} title="pdf" className={className} />
);
export default PDFViewer;
