import { ModeToggle } from "@/components/DarkModeToggle";
import { MainNav } from "@/components/main-nav";
import { MobileNav } from "@/components/mobile-nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <MainNav />
        <MobileNav />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            {/* <Link href="/"> */}
            {/*  <div */}
            {/*    className={buttonVariants({ */}
            {/*      size: "icon", */}
            {/*      variant: "ghost", */}
            {/*    })} */}
            {/*  > */}
            {/*    1<span className="sr-only">GitHub</span> */}
            {/*  </div> */}
            {/* </Link> */}
            {/* <Link href="/"> */}
            {/*  <div */}
            {/*    className={buttonVariants({ */}
            {/*      size: "icon", */}
            {/*      variant: "ghost", */}
            {/*    })} */}
            {/*  > */}
            {/*    2<span className="sr-only">Twitter</span> */}
            {/*  </div> */}
            {/* </Link> */}
            <ModeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}
