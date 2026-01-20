import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Sermon } from '@/types'

export const revalidate = 0

async function getLatestPublishedSermon(): Promise<Sermon | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('sermons')
    .select('*')
    .eq('is_published', true)
    .order('date', { ascending: false })
    .limit(1)

  if (error) {
    console.error('설교 조회 오류:', error)
    return null
  }

  return data?.[0] ?? null
}

export default async function HomePage() {
  const latest = await getLatestPublishedSermon()

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      {/* ✅ 홈 상단은 무조건 블랙/화이트로 고정 (CSS 변수 영향 최소화) */}
      <header className="bg-black text-white text-center py-6 px-4">
        <div className="text-2xl font-bold tracking-tight">DREAMPLUS</div>
        <div className="text-sm opacity-80 mt-1">나만의 설교노트</div>
      </header>

      <main className="max-w-2xl mx-auto w-full px-4 py-8 flex-1">
        {/* ✅ 배너 클릭 -> 최신 공개 설교로 이동 */}
        {latest ? (
          <Link href={`/sermon/${latest.slug}`} className="block">
            <img
              src="/home-banner.png"
              alt="DREAMPLUS 배너"
              className="w-full"
            />
          </Link>
        ) : (
          <>
            <img
              src="/home-banner.png"
              alt="DREAMPLUS 배너"
              className="w-full opacity-60"
            />
            <p className="mt-4 text-sm text-gray-600">
              아직 공개된 설교가 없습니다. (관리자에서 공개로 전환 후 다시 확인해 주세요)
            </p>
          </>
        )}
      </main>

      <footer className="border-t border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-6 text-center">
          <p className="text-xs text-gray-500">© DREAMPLUS · 서울드림교회</p>
        </div>
      </footer>
    </div>
  )
}
