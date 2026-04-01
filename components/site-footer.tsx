import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

function SiteFooter() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <footer className="border-t py-3 px-4 md:px-6">
      <div className="container flex items-center justify-between gap-4">
        <p className="text-[11px] text-muted-foreground/60">
          <a
            href="https://github.com/ntpu-tools"
            target="_blank"
            className="hover:text-muted-foreground transition-colors"
            rel="noreferrer"
          >
            NTPU Tools
          </a>
        </p>
        {mounted && (
          <a
            href="https://zeabur.com/referral?referralCode=f312213213&utm_source=f312213213&utm_campaign=oss"
            className="opacity-60 hover:opacity-90 transition-opacity"
          >
            <img
              src={`https://zeabur.com/deployed-on-zeabur-${resolvedTheme === "dark" ? "dark" : "light"}.svg`}
              alt="Deployed on Zeabur"
              className="h-6"
            />
          </a>
        )}
      </div>
    </footer>
  );
}

export default SiteFooter;
