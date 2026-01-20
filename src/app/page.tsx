import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatDateWithDay } from '@/lib/utils'
import type { Sermon } from '@/types'

export const revalidate = 0

async function getPublishedSermons(): Promise<Sermon[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('sermons')
    .select('*')
    .eq('is_published', true)
    .order('date', { ascending: false })
    .limit(20)

  if (error) {
    console.error('설교 목록 조회 오류:', error)
    return []
  }

  return data || []
}

export default async function HomePage() {
  const sermons = await getPublishedSermons()
  const latest = sermons[0] // ✅ 배너 클릭 시 이동할 "최신 설교" 1개

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      {/* ✅ 블랙 헤더 유지 */}
      <header className="hero-black">
        <div className="title">DREAMPLUS</div>
        <div className="subtitle">나만의 설교노트</div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 flex-1">
        {/* ✅ 배너: 클릭하면 최신 설교로 이동 (유지) */}
        {latest ? (
          <Link href={`/sermon/${latest.slug}`} className="block">
            <img
              src="/home-banner.png"
              alt="DREAMPLUS 배너"
              className="w-full mb-8 cursor-pointer"
            />
          </Link>
        ) : (
          <img
            src="/home-banner.png"
            alt="DREAMPLUS 배너"
            className="w-full mb-8"
          />
        )}

        {sermons.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📖</div>
            <h2 className="text-lg font-medium text-black mb-2">
              아직 공개된 설교가 없습니다
            </h2>
            <p className="text-sm text-gray-500">
              곧 새로운 설교가 등록될 예정입니다
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider mb-4 text-gray-600">
              최근 설교
            </h2>

            {/* ✅ 카드(박스)로 들어가는 건 유지해도 되고, 원하면 여기서 삭제 가능 */}
            {sermons.map((sermon, index) => (
              <Link
                key={sermon.id}
                href={`/sermon/${sermon.slug}`}
                className="block"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <article className="section-card animate-slide-up bg-white border border-gray-200 hover:border-black transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <time className="text-xs text-gray-500 font-medium">
                        {formatDateWithDay(sermon.date)}
                      </time>

                      <h3 className="text-lg font-semibold mt-1 text-black">
                        {sermon.title}
                      </h3>

                      {sermon.preacher && (
                        <p className="text-sm mt-1 text-gray-600">
                          {sermon.preacher} 목사
                        </p>
                      )}

                      {sermon.description && (
                        <p className="text-sm mt-2 line-clamp-2 text-gray-500">
                          {sermon.description}
                        </p>
                      )}
                    </div>

                    <div className="flex-shrink-0 text-gray-500">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
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
