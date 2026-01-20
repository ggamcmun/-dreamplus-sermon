import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Sermon } from '@/types'

export const revalidate = 0

async function getPublishedSermons(): Promise<Sermon[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('sermons')
    .select('slug')
    .eq('is_published', true)
    .order('date', { ascending: false })
    .limit(1) // ✅ 가장 최근 설교 1개만

  if (error) {
    console.error('설교 조회 오류:', error)
    return []
  }

  return data || []
}

export default async function HomePage() {
  const sermons = await getPublishedSermons()
  const latest = sermons[0]

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      {/* 🔥 블랙 헤더 */}
      <header className="hero-black">
        <div className="title">DREAMPLUS</div>
        <div className="subtitle">나만의 설교노트</div>
      </header>

      {/* 메인 영역 */}
      <main className="max-w-2xl mx-auto px-4 py-10 flex-1">
        {latest ? (
          /* ✅ 배너 클릭 → 최신 설교 노트 */
          <Link href={`/sermon/${latest.slug}`} className="block">
            <img
              src="/home-banner.png"
              alt="이번 주 설교 배너"
              className="w-full cursor-pointer"
            />
          </Link>
        ) : (
          /* 설교 없을 때 */
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📖</div>
            <p className="text-sm text-gray-500">
              아직 공개된 설교가 없습니다
            </p>
          </div>
        )}
      </main>

      {/* 푸터 */}
      <footer className="border-t border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-6 text-center">
          <p className="text-xs text-gray-500">
            © DREAMPLUS · 서울드림교회
          </p>
        </div>
      </footer>
    </div>
  )
}
