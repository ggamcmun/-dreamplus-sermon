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
    <div className="min-h-screen bg-church-cream">
      {/* 헤더 */}
      <header className="bg-white border-b border-primary-200">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="font-sermon text-2xl font-semibold text-church-brown">
              DREAMPLUS
            </h1>
            <p className="mt-1 text-sm text-primary-600">
              나만의 설교 노트
            </p>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {sermons.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📖</div>
            <h2 className="font-sermon text-xl text-church-brown mb-2">
              아직 공개된 설교가 없습니다
            </h2>
            <p className="text-primary-600">
              곧 새로운 설교가 등록될 예정입니다
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-sm font-medium text-primary-500 uppercase tracking-wider mb-4">
              최근 설교
            </h2>
            
            {sermons.map((sermon, index) => (
              <Link
                key={sermon.id}
                href={`/sermon/${sermon.slug}`}
                className="block"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <article className="section-card hover:border-church-gold group animate-slide-up">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <time className="text-xs text-primary-500 font-medium">
                        {formatDateWithDay(sermon.date)}
                      </time>
                      <h3 className="font-sermon text-lg font-medium text-church-brown mt-1 group-hover:text-church-gold transition-colors">
                        {sermon.title}
                      </h3>
                      {sermon.preacher && (
                        <p className="text-sm text-primary-600 mt-1">
                          {sermon.preacher} 목사
                        </p>
                      )}
                      {sermon.description && (
                        <p className="text-sm text-primary-500 mt-2 line-clamp-2">
                          {sermon.description}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0 text-primary-400 group-hover:text-church-gold transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
      <footer className="border-t border-primary-200 mt-auto">
        <div className="max-w-2xl mx-auto px-4 py-6 text-center">
          <p className="text-xs text-primary-400">
            © DREAMPLUS · 서울드림교회
          </p>
        </div>
      </footer>
    </div>
  )
}
