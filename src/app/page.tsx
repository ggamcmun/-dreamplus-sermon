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
    .maybeSingle()

  if (error) {
    console.error('최신 설교 조회 오류:', error)
    return null
  }

  return data ?? null
}

export default async function HomePage() {
  const latest = await getLatestPublishedSermon()

  // 최신 설교가 없으면 홈에서 아무 반응 없으니, 안전하게 홈(#)로 처리
  const href = latest?.slug ? `/sermon/${latest.slug}` : '#'

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-text-main)]">
      <header className="hero-black">
        <div className="title">DREAMPLUS</div>
        <div className="subtitle">나만의 설교노트</div>
      </header>

      <main className="flex-1 px-4 py-6">
        <Link
          href={href}
          className={`block w-full max-w-2xl mx-auto ${href === '#' ? 'pointer-events-none opacity-60' : ''}`}
        >
          <img
            src="/home-banner.png"
            alt="설교노트로 이동"
            className="w-full cursor-pointer transition-transform hover:scale-[1.02]"
          />
        </Link>

        {href === '#' && (
          <p className="mt-4 text-center text-sm text-[var(--color-bg-main)]">
            아직 공개된 설교가 없습니다.
          </p>
        )}
      </main>

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
