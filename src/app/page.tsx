import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Sermon } from '@/types'

export const revalidate = 0

type SermonRow = Sermon & {
  banner_image?: string | null
  published_at?: string | null
}

async function getPublishedSermons(): Promise<SermonRow[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('sermons')
    .select(
      'id,title,date,preacher,description,is_published,slug,created_at,updated_at,banner_image,published_at'
    )
    .eq('is_published', true)

  if (error) {
    console.error('설교 조회 오류:', error)
    return []
  }

  const rows = (data ?? []) as SermonRow[]

  // 정렬: 발행 → 날짜 → 생성
  rows.sort((a, b) => {
    const ap = a.published_at ? new Date(a.published_at).getTime() : NaN
    const bp = b.published_at ? new Date(b.published_at).getTime() : NaN
    if (!Number.isNaN(ap) && !Number.isNaN(bp) && ap !== bp) return bp - ap
    if (!Number.isNaN(ap)) return -1
    if (!Number.isNaN(bp)) return 1

    const ad = new Date(a.date).getTime()
    const bd = new Date(b.date).getTime()
    if (ad !== bd) return bd - ad

    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return rows
}

export default async function HomePage() {
  const sermons = await getPublishedSermons()

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      {/* ===============================
          상단 헤더
      ================================ */}
      <header className="bg-black text-white text-center py-4 px-4">
        <div className="text-3xl font-extrabold tracking-tight">
          DREAMPLUS
        </div>

        <div className="mt-2 text-sm opacity-90 leading-relaxed">
          🗓️ 매주 수요일 저녁 19:30<br />
          📍 성수 서울드림비전센터<br />
          <span className="text-xs opacity-80">
            (서울 성동구 왕십리로 88, 노벨빌딩 B1)
          </span>
        </div>

        {/* 🔥 SNS + 새신자 버튼 (높이 통일 + 간격 정리 + 센터 정확히) */}
        <div className="mt-3 flex items-center justify-center gap-3">
          {/* 인스타 */}
          <a
            href="https://www.instagram.com/dreamplus._?igsh=OGRwcXo2ODVxb3Vu"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center"
          >
            <img
              src="/insta.png"
              alt="Instagram"
              className="
                h-10 w-10
                object-contain
                opacity-90
                hover:opacity-100
                transition
              "
            />
          </a>

          {/* 유튜브 */}
          <a
            href="https://youtube.com/channel/UCH5cB7IDzauotvZ9MVkEDlg?si=UvkQPYiV4likVmQX"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center"
          >
            <img
              src="/youtube.png"
              alt="YouTube"
              className="
                h-10 w-10
                object-contain
                opacity-90
                hover:opacity-100
                transition
              "
            />
          </a>

          {/* 새신자 등록 (아이콘 높이와 동일하게 맞춤) */}
          <a
            href="https://forms.gle/644BY2oLTyzRNSh6A"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center"
          >
            <img
              src="/newcomer-banner.png"
              alt="새신자 등록"
              className="
                h-10
                w-auto
                object-contain
                hover:brightness-95
                transition
              "
            />
          </a>
        </div>
      </header>

      {/* ===============================
          안내 문구 + 설교 배너
      ================================ */}
      <main className="max-w-2xl mx-auto w-full px-4 py-6 flex-1 space-y-5">
        {sermons.length > 0 && (
          <p className="text-center text-sm text-gray-600">
            👇 아래 이미지를 클릭하시면{' '}
            <span className="font-medium text-black">
              설교 노트로 들어갈 수 있습니다.
            </span>
          </p>
        )}

        {sermons.length === 0 && (
          <p className="text-center text-sm text-gray-500">
            아직 공개된 설교가 없습니다.
          </p>
        )}

        {sermons.map((sermon) => (
          <Link
            key={sermon.id}
            href={`/sermon/${sermon.slug}`}
            className="block"
          >
            <img
              src={sermon.banner_image || '/home-banner.png'}
              alt={sermon.title}
              className="w-full transition hover:brightness-95"
            />
          </Link>
        ))}
      </main>

      {/* ===============================
          푸터
      ================================ */}
      <footer className="border-t border-gray-200">
        <div className="text-center text-xs text-gray-500 py-4">
          © DREAMPLUS · 서울드림교회
        </div>
      </footer>
    </div>
  )
}
