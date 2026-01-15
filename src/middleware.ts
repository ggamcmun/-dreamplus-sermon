import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ✅ 정적 파일/내부 경로는 건드리지 않기
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // ✅ /admin 로그인/권한없음 페이지는 통과 (여기 막으면 루프남)
  if (
    pathname === "/admin/login" ||
    pathname.startsWith("/admin/login/") ||
    pathname === "/admin/unauthorized" ||
    pathname.startsWith("/admin/unauthorized/")
  ) {
    return NextResponse.next();
  }

  // ✅ /admin 접근 시 로그인 안 했으면 /admin/login 으로 보내기
  if (pathname.startsWith("/admin")) {
    const hasSupabaseCookie = request.cookies
      .getAll()
      .some((c) => c.name.startsWith("sb-"));

    if (!hasSupabaseCookie) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
