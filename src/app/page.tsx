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
      {/* ✅ 홈 상단: 블랙/화이트 고정 */}
      <header className="bg-black text-white text-center px-4 py-6">
        <div className="text-4xl font-extrabold tracking-tight leading-none">
          DREAMPLUS
        </div>

        <div className="mt-4 text-sm leading-relaxed opacity-90">
          ⏰ 매주 수요일 저녁 <span className="font-semibold">19:30</span>
          <br />
          📍 <span className="font-semibold">성수 서울드림비전센터</span>
          <br />
          <span className="text-xs opacity-75">
            (서울 성동구 왕십리로 88, 노벨빌딩 B1)
          </span>
        </div>
      </header>

      {/* ✅ 메인: 배너 클릭 -> 최신 설교 */}
      <main className="max-w-2xl mx-auto w-full px-4 py-8 flex-1">
        {latest ? (
          <Link href={`/sermon/${latest.slug}`} className="block">
            <img
              src="/home-banner.png"
              alt="DREAMPLUS 배너"
              className="w-full h-auto"
            />
          </Link>
        ) : (
          <div>
            <img
              src="/home-banner.png"
              alt="DREAMPLUS 배너"
              className="w-full h-auto opacity-60"
            />
            <p className="mt-4 text-sm text-gray-600">
              아직 공개된 설교가 없습니다. (관리자에서 공개로 전환 후 다시 확인해 주세요)
            </p>
          </div>
        )}
      </main>

      {/* ✅ 푸터: 화면 아래에 붙게 */}
      <footer className="border-t border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-5 text-center">
          <p className="text-xs text-gray-500">© DREAMPLUS · 서울드림교회</p>
        </div>
      </footer>
    </div>
  )
}
