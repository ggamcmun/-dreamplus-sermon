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
    <div className="flex min-h-screen flex-col bg-white text-black">
      {/* ===============================
          상단 헤더 (블랙 & 화이트 고정)
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
          <>
            {/* ✅ 첫 번째 배너: 최신 공개 설교로 이동 */}
            <Link
              href={`/sermon/${latest.slug}`}
              className="block cursor-pointer group"
            >
              <img
                src="/home-banner.png"
                alt="이번 주 설교 노트 바로가기"
                className="
                  w-full h-auto
                  transition-all duration-300
                  group-hover:brightness-90
                "
              />
            </Link>

            {/* ✅ 두 번째 배너: 고정 슬러그로 이동 */}
            <Link
              href="/sermon/20260128-교회-2-꼭-교회에-다녀야만-예수님을-믿을-수-있나요"
              className="block cursor-pointer group mt-4"
            >
              <img
                src="/home-banner02.png"
                alt="교회 #2 설교 노트 바로가기"
                className="
                  w-full h-auto
                  transition-all duration-300
                  group-hover:brightness-90
                "
              />
            </Link>
          </>
        ) : (
          <>
            <img
              src="/home-banner.png"
              alt="DREAMPLUS 배너"
              className="w-full h-auto opacity-60"
            />
            <p className="mt-6 text-sm text-gray-600 text-center">
              아직 공개된 설교가 없습니다.<br />
              관리자 페이지에서 설교를 공개로 전환해 주세요.
            </p>
          </>
        )}
      </main>

      {/* ===============================
          푸터 (항상 바로 보이게)
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
