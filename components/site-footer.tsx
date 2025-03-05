function SiteFooter() {
  return (
    <footer className="py-3 md:px-8 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-14 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          Shipped by{" "}
          <a
            href="https://github.com/ntpu-tools"
            target="_blank"
            className="font-medium underline underline-offset-4"
            rel="noreferrer"
          >
            NTPU Tools
          </a>
        </p>
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          version:{" "}
          {process.env.NEXT_PUBLIC_GIT_COMMIT_SHA?.slice(0, 7) ?? "local"}
        </p>
        <a href="https://zeabur.com?referralCode=f312213213&utm_source=f312213213&utm_campaign=oss">
          <img
            src="https://zeabur.com/deployed-on-zeabur-dark.svg"
            alt="Deployed on Zeabur"
          />
        </a>
      </div>
    </footer>
  );
}

export default SiteFooter;
