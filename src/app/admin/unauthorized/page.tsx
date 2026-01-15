import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">접근 권한 없음</h1>
        <p className="text-gray-500 mb-6">
          관리자 권한이 없는 계정입니다.
          <br />
          교회 담당자에게 문의해주세요.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-church-navy text-white rounded-xl font-medium hover:bg-opacity-90 transition-colors"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  )
}
