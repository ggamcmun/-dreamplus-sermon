'use client'

import { createClient } from '@/lib/supabase/client'

interface Props {
  onClose: () => void
}

export default function LoginPrompt({ onClose }: Props) {
  const supabase = createClient()

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(window.location.pathname)}`,
      },
    })

    if (error) {
      console.error('로그인 오류:', error)
      alert('로그인에 실패했습니다. 다시 시도해주세요.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* 배경 오버레이 */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* 모달 */}
      <div className="relative bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md mx-auto animate-slide-up">
        <div className="p-6 sm:p-8">
          {/* 닫기 버튼 */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-primary-100 text-primary-500 hover:bg-primary-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* 아이콘 */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-church-gold/10 mb-4">
              <span className="text-3xl">📝</span>
            </div>
            <h2 className="font-sermon text-xl font-semibold text-church-brown">
              로그인이 필요해요
            </h2>
            <p className="mt-2 text-primary-600 leading-relaxed">
              메모는 로그인 후 안전하게 저장됩니다 🙂
              <br />
              <span className="text-sm text-primary-500">
                다른 기기에서도 내 메모를 볼 수 있어요
              </span>
            </p>
          </div>

          {/* 구글 로그인 버튼 */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white border-2 border-primary-200 rounded-xl font-medium text-church-brown hover:border-church-gold hover:bg-church-gold/5 transition-all"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google로 로그인
          </button>

          {/* 안내 문구 */}
          <p className="mt-4 text-center text-xs text-primary-400">
            로그인 없이도 설교 내용은 계속 볼 수 있어요
          </p>
        </div>

        {/* 모바일 하단 여백 (Safe Area) */}
        <div className="h-6 sm:hidden" />
      </div>
    </div>
  )
}
