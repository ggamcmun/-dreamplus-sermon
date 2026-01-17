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

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-text-main)]">

      {/* 🔥 상단 헤더 */}
      <header className="hero-black">
        <div className="title">DREAMPLUS</div>
        <div className="subtitle">나만의 설교노트</div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-2xl mx-auto px-4 py-8 flex-1">

        {/* 🔥 홈 배너 이미지 */}
        <img
          src="/home-banner.png"
          alt="DREAMPLUS 배너"
          className="w-full mb-8"
        />

        {sermons.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📖</div>
            <h2 className="text-lg font-medium text-[var(--color-bg-main)] mb-2">
              아직 공개된 설교가 없습니다
            </h2>
            <p className="text-sm text-[var(--color-bg-main)]/80">
              곧 새로운 설교가 등록될 예정입니다
            </p>
          </div>
        ) : (
          <div className="space-y-4">

            {/* ✅ 최근 설교 텍스트 */}
            <h2 className="text-xs font-bold uppercase tracking-wider mb-4 text-[var(--color-bg-main)]">
              최근 설교
            </h2>

            {sermons.map((sermon, index) => (
              <Link
                key={sermon.id}
                href={`/sermon/${sermon.slug}`}
                className="block"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* ✅ 설교 카드 (청록 배경 + 핑크 텍스트) */}
                <article className="section-card animate-slide-up bg-[var(--color-bg-main)] border border-white transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <time className="text-xs font-medium text-[var(--color-text-main)]/85">
                        {formatDateWithDay(sermon.date)}
                      </time>

                      <h3 className="text-lg font-semibold mt-1 text-[var(--color-text-main)]">
                        {sermon.title}
                      </h3>

                      {sermon.preacher && (
                        <p className="text-sm mt-1 text-[var(--color-text-main)]/85">
                          {sermon.preacher} 목사
                        </p>
                      )}

                      {sermon.description && (
                        <p className="text-sm mt-2 line-clamp-2 text-[var(--color-text-main)]/75">
                          {sermon.description}
                        </p>
                      )}
                    </div>

                    <div className="flex-shrink-0 text-[var(--color-text-main)]/85">
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

      {/* 푸터 */}
      <footer className="border-t border-[rgba(10,143,130,0.25)]">
        <div className="max-w-2xl mx-auto px-4 py-6 text-center">
          <p className="text-xs text-[var(--color-bg-main)]">
            © DREAMPLUS · 서울드림교회
          </p>
        </div>
      </footer>
    </div>
  )
}
