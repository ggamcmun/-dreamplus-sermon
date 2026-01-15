import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ✅ 이 경로들은 검사하지 않는다 (무한 튕김 방지)
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // ✅ /admin 은 관리자 페이지
  if (pathname.startsWith("/admin")) {
    const isAdmin = request.cookies.get("admin")?.value === "true";

    // 관리자 아니면 로그인 페이지로 보냄
    if (!isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
