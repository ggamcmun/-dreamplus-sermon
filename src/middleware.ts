import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ✅ 로그인/권한없음 페이지는 무조건 통과 (뒤에 / 붙어도 통과)
  if (
    pathname.startsWith("/admin/login") ||
    pathname.startsWith("/admin/unauthorized")
  ) {
    return NextResponse.next();
  }

  // ✅ 정적 파일/내부 요청은 통과
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // ✅ /admin 이하만 보호: supabase 쿠키 없으면 로그인으로
  const hasSupabaseCookie = request.cookies
    .getAll()
    .some((c) => c.name.startsWith("sb-"));

  if (!hasSupabaseCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// ✅ 진짜 중요한 부분: /admin 아래에서만 미들웨어가 돌게 제한
export const config = {
  matcher: ["/admin/:path*"],
};
