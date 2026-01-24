import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Sermon } from '@/types'

/* ❌ revalidate 제거 (타입 에러 방지) */

async function getLatestPublishedSermon(): Promise<Sermon | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('sermons')
    .select('*')
    .eq('is_published', true)
    .order('date', { ascending: false }) // 최신 설교가 위로
    .limit(1)

  if (error) {
    console.error('설교 조회 오류:', error)
    return null
  }

  return data?.[0] ?? null
}

/* ✅ 이름을 반드시 Page 로 */
export default async function Page() {
  const latest = await getLatestPublishedSermon()

  return (
    <div className="flex min-h-screen flex-col bg-white text-black">
      {/* ===============================
          상단 헤더
      ================================ */}
      <header className="bg-black text-white text-center py-8 px-4">
        <div className="text-3xl font-extrabold tracking-tight">
          DREAMPLUS
        </div>
        <div className="mt-3 text-sm leading-relaxed opacity-85">
          🗓️ 매주 수요일 저녁 19:30<br />
          📍 성수 서울드림비전센터<br />
          <span className="text-xs opacity-80">
            (서울 성동구 왕십리로 88, 노벨빌딩 B1)
          </span>
        </div>
      </header>

      {/* ===============================
          메인 콘텐츠
      ================================ */}
      <main className="max-w-2xl mx-auto w-full px-4 py-10 flex-1">
        {latest ? (
          <Link
            href={`/sermon/${latest.slug}`}
            className="block group"
          >
            <img
              src="/home-banner.png"
              alt="이번 주 설교 노트 바로가기"
              className="w-full transition-all duration-300 group-hover:brightness-90"
            />
          </Link>
        ) : (
          <>
            <img
              src="/home-banner.png"
              alt="DREAMPLUS 배너"
              className="w-full opacity-60"
            />
            <p className="mt-6 text-sm text-gray-600 text-center">
              아직 공개된 설교가 없습니다.
            </p>
          </>
        )}
      </main>

      {/* ===============================
          푸터
      ================================ */}
      <footer className="border-t border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4 text-center">
          <p className="text-xs text-gray-500">
            © DREAMPLUS · 서울드림교회
          </p>
        </div>
      </footer>
    </div>
  )
}
