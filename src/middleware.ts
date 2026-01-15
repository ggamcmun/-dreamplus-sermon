import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // ✅ 디버그용: 어떤 경로든 무조건 통과(리다이렉트 없음)
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
