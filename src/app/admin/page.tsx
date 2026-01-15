import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboard() {
  const supabase = createClient()

  // 통계 조회
  const { count: sermonCount } = await supabase
    .from('sermons')
    .select('*', { count: 'exact', head: true })

  const { count: publishedCount } = await supabase
    .from('sermons')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true)

  const { count: noteCount } = await supabase
    .from('notes')
    .select('*', { count: 'exact', head: true })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">관리자 대시보드</h1>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="admin-card">
          <div className="text-3xl font-bold text-church-navy">
            {sermonCount || 0}
          </div>
          <div className="text-sm text-gray-500 mt-1">전체 설교</div>
        </div>
        <div className="admin-card">
          <div className="text-3xl font-bold text-church-sage">
            {publishedCount || 0}
          </div>
          <div className="text-sm text-gray-500 mt-1">공개된 설교</div>
        </div>
        <div className="admin-card">
          <div className="text-3xl font-bold text-church-gold">
            {noteCount || 0}
          </div>
          <div className="text-sm text-gray-500 mt-1">작성된 메모</div>
        </div>
      </div>

      {/* 빠른 링크 */}
      <div className="admin-card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">빠른 작업</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/sermons/new" className="admin-btn admin-btn-primary">
            ➕ 새 설교 만들기
          </Link>
          <Link href="/admin/sermons" className="admin-btn admin-btn-secondary">
            📋 설교 목록 보기
          </Link>
          <Link href="/" className="admin-btn admin-btn-secondary" target="_blank">
            🌐 사이트 보기
          </Link>
        </div>
      </div>
    </div>
  )
}
