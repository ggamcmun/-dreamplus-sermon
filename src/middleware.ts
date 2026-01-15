import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ✅ 로그인/권한없음은 무조건 통과 (뒤에 / 붙어도 통과)
  if (pathname.startsWith("/admin/login") || pathname.startsWith("/admin/unauthorized")) {
    return NextResponse.next();
  }

  // ✅ /admin만 보호
  if (pathname.startsWith("/admin")) {
    const hasSbCookie = request.cookies
      .getAll()
      .some((c) => c.name.startsWith("sb-"));

    if (!hasSbCookie) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
