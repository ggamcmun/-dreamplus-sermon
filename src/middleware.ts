import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ✅ 로그인 페이지는 절대 건드리지 않기 (루프 방지)
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // ✅ 그 외 /admin 은 로그인 없으면 로그인으로 보내기
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

// ✅ 미들웨어 적용 범위를 /admin 아래로만 제한 (중요!)
export const config = {
  matcher: ["/admin/:path*"],
};
