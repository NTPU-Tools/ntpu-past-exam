import { useEffect } from "react";

export function useDocumentTitle(title: string | undefined) {
  useEffect(() => {
    if (title) {
      document.title = `${title} - NTPU 考古題`;
    }
  }, [title]);
}
