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

// ✅ "교회#2" 같은 번호를 제목에서 뽑아 정렬용으로 씀
function getChurchSeriesNumber(title: string) {
  const m = title.match(/교회\s*#\s*(\d+)/i)
  return m ? Number(m[1]) : 9999
}

export default async function HomePage() {
  const sermons = await getPublishedSermons()

  // ✅ 교회 시리즈: 제목에 "교회#숫자"가 들어간 설교들만 묶기
  const churchSeries = sermons
    .filter((s) => /교회\s*#\s*\d+/i.test(s.title))
    .sort((a, b) => getChurchSeriesNumber(a.title) - getChurchSeriesNumber(b.title))

  // ✅ 나머지 설교들(교회 시리즈 제외)
  const others = sermons.filter((s) => !/교회\s*#\s*\d+/i.test(s.title))

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      {/* ===============================
          상단 헤더
      ================================ */}
      <header className="bg-black text-white text-center py-4 px-4">
        <div className="text-3xl font-extrabold tracking-tight">DREAMPLUS</div>

        <div className="mt-2 text-sm opacity-90 leading-relaxed">
          🗓️ 매주 수요일 저녁 19:30<br />
          📍 성수 서울드림비전센터<br />
          <span className="text-xs opacity-80">
            (서울 성동구 왕십리로 88, 노벨빌딩 B1)
          </span>
        </div>

        {/* ✅ SNS + 새신자 버튼 */}
        <div className="mt-3 flex items-center justify-center gap-3">
          <a
            href="https://www.instagram.com/dreamplus._?igsh=OGRwcXo2ODVxb3Vu"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center"
          >
            <img
              src="/insta.png"
              alt="Instagram"
              className="h-12 w-12 object-contain opacity-90 hover:opacity-100 transition"
            />
          </a>

          <a
            href="https://youtube.com/channel/UCH5cB7IDzauotvZ9MVkEDlg?si=UvkQPYiV4likVmQX"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center"
          >
            <img
              src="/youtube.png"
              alt="YouTube"
              className="h-12 w-12 object-contain opacity-90 hover:opacity-100 transition"
            />
          </a>

          <a
            href="https://forms.gle/644BY2oLTyzRNSh6A"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center"
          >
            <img
              src="/newcomer-banner.png"
              alt="새신자 등록"
              className="h-12 w-auto max-w-[200px] object-contain hover:brightness-95 transition"
            />
          </a>
        </div>
      </header>

      {/* ===============================
          안내 문구 + 콘텐츠
      ================================ */}
      <main className="max-w-2xl mx-auto w-full px-4 py-6 flex-1 space-y-5">
        {(churchSeries.length > 0 || others.length > 0) && (
          <p className="text-center text-sm text-gray-600">
            👇 아래 이미지를 클릭하시면{' '}
            <span className="font-medium text-black">설교 노트로 들어갈 수 있습니다.</span>
          </p>
        )}

        {(churchSeries.length === 0 && others.length === 0) && (
          <p className="text-center text-sm text-gray-500">아직 공개된 설교가 없습니다.</p>
        )}

        {/* ===============================
            ✅ 교회 시리즈 묶음 (버튼 1개 → 펼치면 3개)
        ================================ */}
        {churchSeries.length > 0 && (
          <details className="border border-gray-200 rounded-xl p-3">
            <summary className="cursor-pointer list-none">
              <div className="group">
                <img
                  src="/church-series.png"
                  alt="교회 시리즈"
                  className="w-full h-auto transition group-hover:brightness-95"
                />
              </div>
            </summary>

            <div className="mt-3 space-y-4">
              {churchSeries.map((sermon) => {
                const bannerSrc =
                  sermon.banner_image?.trim() ? sermon.banner_image : '/home-banner.png'

                return (
                  <Link key={sermon.id} href={`/sermon/${sermon.slug}`} className="block">
                    <img
                      src={bannerSrc}
                      alt={sermon.title}
                      className="w-full h-auto transition hover:brightness-95"
                    />
                  </Link>
                )
              })}
            </div>
          </details>
        )}

        {/* ===============================
            ✅ 나머지 설교들(최신순 그대로)
        ================================ */}
        {others.map((sermon) => {
          const bannerSrc =
            sermon.banner_image?.trim() ? sermon.banner_image : '/home-banner.png'

          return (
            <Link key={sermon.id} href={`/sermon/${sermon.slug}`} className="block">
              <img
                src={bannerSrc}
                alt={sermon.title}
                className="w-full h-auto transition hover:brightness-95"
              />
            </Link>
          )
        })}
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
