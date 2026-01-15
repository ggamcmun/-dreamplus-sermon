import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AdminLogout from '@/components/AdminLogout'
import { headers } from 'next/headers'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // ✅ 지금 요청 경로 확인
  const pathname = headers().get('x-invoke-path') || headers().get('next-url') || ''

  // ✅ 로그인/권한없음 페이지는 이 레이아웃에서 가드하지 말고 통과 (루프 방지)
  if (pathname.startsWith('/admin/login') || pathname.startsWith('/admin/unauthorized')) {
    return <>{children}</>
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/admin/unauthorized')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-church-navy text-white">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/admin" className="font-semibold text-lg">
                ⚙️ 설교노트 관리
              </Link>
              <nav className="hidden sm:flex items-center gap-4 text-sm">
                <Link href="/admin/sermons" className="text-white/80 hover:text-white transition-colors">
                  설교 관리
                </Link>
                <Link href="/admin/sermons/new" className="text-white/80 hover:text-white transition-colors">
                  새 설교
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-white/70 hidden sm:block">
                {user.email}
              </span>
              <AdminLogout />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
