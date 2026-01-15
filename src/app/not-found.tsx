import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-church-cream flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-6xl mb-4">📖</div>
        <h1 className="font-sermon text-2xl font-semibold text-church-brown mb-2">
          페이지를 찾을 수 없습니다
        </h1>
        <p className="text-primary-600 mb-6">
          요청하신 설교 또는 페이지가 존재하지 않습니다
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-church-gold text-white rounded-xl font-medium hover:bg-opacity-90 transition-colors"
        >
          ← 설교 목록으로
        </Link>
      </div>
    </div>
  )
}
