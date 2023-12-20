import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const STRICT_BACK_TO_INDEX = ["/admin"];
const ALWAYS_ALLOW = [""];

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (ALWAYS_ALLOW.includes(path)) {
    return NextResponse.next();
  }

  if (STRICT_BACK_TO_INDEX.includes(path)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    const accessToken = request.cookies.get("ntpu-past-exam-access-token")
      ?.value;

    if (!accessToken) {
      throw Error();
    }

    const response = await fetch(`${process.env.API_ORIGIN}/verify-token`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status !== 200) {
      throw Error();
    }

    if (path === "/") return NextResponse.next();

    const data = await response.json();

    if (path.startsWith("/admin")) {
      if (data?.admin.length === 0) {
        return NextResponse.redirect(new URL("/", request.url));
      }
      const departmentId = path.split("/admin/")[1];
      if (data?.admin?.includes(departmentId)) {
        return NextResponse.next();
      }
      return NextResponse.redirect(new URL("/", request.url));
    }

    const departmentId = path.split("/")[1];

    if (data?.visible_departments?.includes(departmentId)) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL("/", request.url));
  } catch (e) {
    console.log(e);
    if (path === "/login") {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/((?!api|favicon.ico|static|_next).*)"],
};
