'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatDateWithDay, cn } from '@/lib/utils'
import type { Sermon, Section, Note, SaveStatus } from '@/types'
import LoginPrompt from '@/components/LoginPrompt'

interface Props {
  sermon: Sermon
  sections: Section[]
  initialNotes: Note[]
  userId: string | null
}

export default function SermonNoteClient({ sermon, sections, initialNotes, userId }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(!!userId)
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const supabase = createClient()

  // 초기 메모 로드
  useEffect(() => {
    const noteMap: Record<string, string> = {}
    initialNotes.forEach(note => {
      noteMap[note.section_id] = note.content
    })
    setNotes(noteMap)
  }, [initialNotes])

  // 인증 상태 감시
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setIsLoggedIn(!!session?.user)
        
        if (event === 'SIGNED_IN' && session?.user) {
          setShowLoginPrompt(false)
          // 로그인 후 기존 메모 불러오기
          await loadUserNotes(session.user.id)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [sections])

  // 사용자 메모 로드
  const loadUserNotes = async (userId: string) => {
    if (sections.length === 0) return

    const sectionIds = sections.map(s => s.id)
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .in('section_id', sectionIds)

    if (!error && data) {
      const noteMap: Record<string, string> = {}
      data.forEach(note => {
        noteMap[note.section_id] = note.content
      })
      setNotes(noteMap)
    }
  }

  // 메모 저장
  const saveNote = useCallback(async (sectionId: string, content: string) => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true)
      return
    }

    setSaveStatus('saving')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setSaveStatus('error')
        return
      }

      // upsert로 저장 (있으면 업데이트, 없으면 생성)
      const { error } = await supabase
        .from('notes')
        .upsert(
          {
            section_id: sectionId,
            user_id: user.id,
            content: content,
            updated_at: new Date().toISOString()
          },
          {
            onConflict: 'section_id,user_id'
          }
        )

      if (error) {
        console.error('메모 저장 오류:', error)
        setSaveStatus('error')
      } else {
        setSaveStatus('saved')
        // 3초 후 상태 초기화
        setTimeout(() => setSaveStatus('idle'), 3000)
      }
    } catch (err) {
      console.error('메모 저장 실패:', err)
      setSaveStatus('error')
    }
  }, [isLoggedIn, supabase])

  // 메모 변경 핸들러 (debounce 적용)
  const handleNoteChange = (sectionId: string, content: string) => {
    // 로컬 상태 즉시 업데이트
    setNotes(prev => ({ ...prev, [sectionId]: content }))

    // 로그인 안 된 경우 프롬프트 표시
    if (!isLoggedIn) {
      setShowLoginPrompt(true)
      return
    }

    // 기존 타이머 취소
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // 800ms 후 저장
    saveTimeoutRef.current = setTimeout(() => {
      saveNote(sectionId, content)
    }, 800)
  }

  // 구간 이동
  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const goToNext = () => {
    if (currentIndex < sections.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  // 키보드 네비게이션
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement) return
      
      if (e.key === 'ArrowLeft') {
        goToPrevious()
      } else if (e.key === 'ArrowRight') {
        goToNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, sections.length])

  const currentSection = sections[currentIndex]

  if (sections.length === 0) {
    return (
      <div className="min-h-screen bg-church-cream flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-5xl mb-4">📝</div>
          <h2 className="font-sermon text-xl text-church-brown mb-2">
            아직 설교 구간이 준비되지 않았습니다
          </h2>
          <p className="text-primary-600 mb-6">
            곧 준비될 예정입니다
          </p>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-church-gold hover:underline"
          >
            ← 설교 목록으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-church-cream flex flex-col">
      {/* 헤더 */}
      <header className="bg-white border-b border-primary-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link 
              href="/" 
              className="text-primary-400 hover:text-church-brown transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            
            <div className="text-center flex-1 mx-4">
              <h1 className="font-sermon text-base font-medium text-church-brown truncate">
                {sermon.title}
              </h1>
              <p className="text-xs text-primary-500">
                {formatDateWithDay(sermon.date)}
              </p>
            </div>

            {/* 저장 상태 표시 */}
            <div className="w-20 text-right">
              {saveStatus === 'saving' && (
                <span className="save-indicator saving">
                  <span className="spinner" />
                  저장 중
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="save-indicator saved">
                  ✓ 저장됨
                </span>
              )}
              {saveStatus === 'error' && (
                <span className="save-indicator error">
                  ⚠ 실패
                </span>
              )}
            </div>
          </div>

          {/* 진행률 표시 */}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-primary-500 font-medium">
              {currentIndex + 1} / {sections.length}
            </span>
            <div className="flex-1 h-1 bg-primary-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-church-gold transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / sections.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-4">
        {/* 구간 네비게이션 (미니맵) */}
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          {sections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                'flex-shrink-0 w-8 h-8 rounded-full text-xs font-medium transition-all',
                index === currentIndex
                  ? 'bg-church-gold text-white scale-110'
                  : notes[section.id]
                    ? 'bg-church-sage/30 text-church-brown'
                    : 'bg-primary-200 text-primary-500 hover:bg-primary-300'
              )}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {/* 현재 구간 */}
        <div className="section-card active animate-fade-in" key={currentSection.id}>
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-church-gold text-white text-sm font-bold">
                {currentIndex + 1}
              </span>
              <h2 className="font-sermon text-lg font-semibold text-church-brown">
                {currentSection.title}
              </h2>
            </div>
            
            {currentSection.key_verses && (
              <p className="text-sm text-church-gold font-medium mb-2">
                📖 {currentSection.key_verses}
              </p>
            )}
            
            <p className="text-primary-700 leading-relaxed">
              {currentSection.summary}
            </p>
          </div>

          {/* 메모 입력 영역 */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-primary-600 mb-2">
              ✍️ 나의 메모
            </label>
            <textarea
              className="note-textarea w-full"
              placeholder="이 구간에서 느낀 점, 적용할 점을 자유롭게 적어보세요..."
              value={notes[currentSection.id] || ''}
              onChange={(e) => handleNoteChange(currentSection.id, e.target.value)}
              rows={5}
            />
            
            {!isLoggedIn && (
              <p className="mt-2 text-xs text-primary-500 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                로그인하시면 메모가 자동으로 저장됩니다
              </p>
            )}
          </div>
        </div>

        {/* 이전/다음 버튼 */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className={cn(
              'flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2',
              currentIndex === 0
                ? 'bg-primary-100 text-primary-400 cursor-not-allowed'
                : 'bg-white border border-primary-300 text-church-brown hover:border-church-gold hover:text-church-gold'
            )}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            이전
          </button>
          
          <button
            onClick={goToNext}
            disabled={currentIndex === sections.length - 1}
            className={cn(
              'flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2',
              currentIndex === sections.length - 1
                ? 'bg-primary-100 text-primary-400 cursor-not-allowed'
                : 'bg-church-gold text-white hover:bg-church-gold/90'
            )}
          >
            다음
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </main>

      {/* 하단 설교자 정보 */}
      {sermon.preacher && (
        <footer className="border-t border-primary-200 bg-white/50">
          <div className="max-w-2xl mx-auto px-4 py-3 text-center">
            <p className="text-sm text-primary-600">
              {sermon.preacher} 목사 · {formatDateWithDay(sermon.date)}
            </p>
          </div>
        </footer>
      )}

      {/* 로그인 프롬프트 모달 */}
      {showLoginPrompt && (
        <LoginPrompt onClose={() => setShowLoginPrompt(false)} />
      )}
    </div>
  )
}
