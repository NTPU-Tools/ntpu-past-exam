export function RouteLoading() {
  return (
    <div
      className="flex min-h-[calc(100dvh-3rem)] items-center justify-center bg-background"
      role="status"
      aria-live="polite"
    >
      <span className="text-sm text-muted-foreground">頁面載入中…</span>
    </div>
  )
}
