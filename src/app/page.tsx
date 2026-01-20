import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-text-main)]">
      
      {/* 상단 DREAMPLUS 헤더 */}
      <header className="hero-black">
        <div className="title">DREAMPLUS</div>
        <div className="subtitle">나만의 설교노트</div>
      </header>

      {/* 배너 클릭 영역 */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Link href="/sermon" className="block w-full max-w-2xl">
          <img
            src="/home-banner.png"
            alt="설교노트로 이동"
            className="w-full cursor-pointer transition-transform hover:scale-[1.02]"
          />
        </Link>
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
