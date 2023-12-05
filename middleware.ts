import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  try {
    if (request.url.includes("/_next")) {
      return NextResponse.next();
    }
    const path = request.nextUrl.pathname;
    const accessToken = request.cookies.get("ntpu-past-exam-access-token")
      ?.value;

    if (!accessToken) {
      if (path === "/login") return NextResponse.next();
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const response = await fetch(`${process.env.API_ORIGIN}/verify-token`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status !== 200) {
      throw Error();
    }

    const data = await response.json();

    if (!data?.is_active) {
      if (path === "/inactive") return NextResponse.next();
      return NextResponse.redirect(new URL("/inactive", request.url));
    }

    if (!data?.is_admin && path.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (path === "/login" || path === "/inactive") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  } catch (e) {
    console.log(e);

    return NextResponse.redirect(new URL("/login", request.url));
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: "/((?!api|_next/data|_next/static|_next/image|favicon.ico).*)",
};
