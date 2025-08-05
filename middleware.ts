import { type NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "./src/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createMiddlewareClient(request, response);

  // 세션 새로고침
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 인증이 필요한 경로들
  const protectedPaths = [
    "/dashboard",
    "/profile",
    "/settings",
    "/projects",
    "/contracts",
    "/messages",
  ];
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  // 인증되지 않은 사용자가 보호된 경로에 접근하려고 할 때
  if (isProtectedPath && !session) {
    const redirectUrl = new URL("/", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // 인증된 사용자가 로그인 페이지에 접근하려고 할 때 (선택사항)
  if (session && request.nextUrl.pathname === "/") {
    const redirectUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
