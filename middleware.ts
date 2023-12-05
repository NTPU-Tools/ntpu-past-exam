import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  try {
    const path = request.nextUrl.pathname;
    const accessToken = request.cookies.get("ntpu-past-exam-access-token")
      ?.value;

    if (!accessToken) {
      if (path === "/login") return NextResponse.next();
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const response = await fetch(`${process.env.API_ORIGIN}/users/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!data?.is_active) {
      if (path === "/inactive") return NextResponse.next();
      return NextResponse.redirect(new URL("/inactive", request.url));
    }

    if (!data?.is_admin && path.startsWith("/admin")) {
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
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
