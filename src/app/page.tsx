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

  // ✅ published_at 컬럼이 있을 수도/없을 수도 있어서 일단 다 가져오고
  // 정렬은 아래에서 안전하게 처리
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

  // ✅ 정렬 우선순위: published_at > date > created_at
  rows.sort((a, b) => {
    const ap = a.published_at ? new Date(a.published_at).getTime() : NaN
    const bp = b.published_at ? new Date(b.published_at).getTime() : NaN
    if (!Number.isNaN(ap) && !Number.isNaN(bp) && ap !== bp) return bp - ap
    if (!Number.isNaN(ap) && Number.isNaN(bp)) return -1
    if (Number.isNaN(ap) && !Number.isNaN(bp)) return 1

    const ad = a.date ? new Date(a.date).getTime() : NaN
    const bd = b.date ? new Date(b.date).getTime() : NaN
    if (!Number.isNaN(ad) && !Number.isNaN(bd) && ad !== bd) return bd - ad
    if (!Number.isNaN(ad) && Number.isNaN(bd)) return -1
    if (Number.isNaN(ad) && !Number.isNaN(bd)) return 1

    const ac = a.created_at ? new Date(a.created_at).getTime() : 0
    const bc = b.created_at ? new Date(b.created_at).getTime() : 0
    return bc - ac
  })

  return rows
}

export default async function HomePage() {
  const sermons = await getPublishedSermons()

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      {/* ===============================
          상단 헤더 (조금 더 두껍게 + 새신자 버튼 추가)
      ================================ */}
      <header className="bg-black text-white text-center py-10 px-4">
        <div className="text-4xl font-extrabold tracking-tight">
          DREAMPLUS
        </div>

        <div className="mt-4 text-sm leading-relaxed opacity-90">
          🗓️ 매주 수요일 저녁 19:30<br />
          📍 성수 서울드림비전센터<br />
          <span className="text-xs opacity-80">
            (서울 성동구 왕십리로 88, 노벨빌딩 B1)
          </span>
        </div>

        {/* ✅ 새신자 등록 버튼(이미지) */}
        <div className="mt-8">
          <a
            href="https://forms.gle/644BY2oLTyzRNSh6A"
            target="_blank"
            rel="noreferrer"
            className="block"
          >
            <img
              src="/newcomer-banner.png"
              alt="새신자 등록"
              className="
                w-full
                max-w-md
                mx-auto
                cursor-pointer
                transition-all duration-300
                hover:scale-[1.03]
                hover:brightness-95
                hover:shadow-xl
              "
            />
          </a>
        </div>
      </header>

      {/* ===============================
          설교 배너 리스트
          ✅ 최신 발행 설교가 맨 위
      ================================ */}
      <main className="max-w-2xl mx-auto w-full px-4 py-10 flex-1 space-y-6">
        {sermons.length === 0 && (
          <p className="text-center text-sm text-gray-500">
            아직 공개된 설교가 없습니다.
          </p>
        )}

        {sermons.map((sermon) => {
          const bannerSrc =
            sermon.banner_image?.trim() ? sermon.banner_image : '/home-banner.png'

          return (
            <Link
              key={sermon.id}
              href={`/sermon/${sermon.slug}`}
              className="block group"
            >
              <img
                src={bannerSrc}
                alt={sermon.title}
                className="
                  w-full h-auto
                  transition-all duration-300
                  group-hover:brightness-90
                  group-hover:contrast-110
                "
              />
            </Link>
          )
        })}
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
