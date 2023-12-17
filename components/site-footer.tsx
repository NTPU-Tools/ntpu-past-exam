function SiteFooter() {
  return (
    <footer className="py-3 md:px-8 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-14 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          Built by{" "}
          <a
            href="https://chiendavid.com"
            target="_blank"
            className="font-medium underline underline-offset-4"
            rel="noreferrer"
          >
            david
          </a>
          . Made with ❤️
        </p>
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          version:{" "}
          {process.env.NEXT_PUBLIC_ZEABUR_GIT_COMMIT_SHA?.slice(0, 7) ?? "dev"}
        </p>
      </div>
    </footer>
  );
}

export default SiteFooter;
