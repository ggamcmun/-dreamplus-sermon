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

  useEffect(() => {
    const noteMap: Record<string, string> = {}
    initialNotes.forEach(note => {
      noteMap[note.section_id] = note.content
    })
    setNotes(noteMap)
  }, [initialNotes])

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setIsLoggedIn(!!session?.user)

        if (event === 'SIGNED_IN' && session?.user) {
          setShowLoginPrompt(false)
          await loadUserNotes(session.user.id)
        }
      }
    )

    return () => subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections])

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
        setTimeout(() => setSaveStatus('idle'), 3000)
      }
    } catch (err) {
      console.error('메모 저장 실패:', err)
      setSaveStatus('error')
    }
  }, [isLoggedIn, supabase])

  const handleNoteChange = (sectionId: string, content: string) => {
    setNotes(prev => ({ ...prev, [sectionId]: content }))

    if (!isLoggedIn) {
      setShowLoginPrompt(true)
      return
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveNote(sectionId, content)
    }, 800)
  }

  const goToPrevious = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1)
  }

  const goToNext = () => {
    if (currentIndex < sections.length - 1) setCurrentIndex(currentIndex + 1)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'ArrowLeft') goToPrevious()
      else if (e.key === 'ArrowRight') goToNext()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, sections.length])

  const currentSection = sections[currentIndex]

  if (sections.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-5xl mb-4">📝</div>
          <h2 className="text-xl font-semibold text-black mb-2">
            아직 설교 구간이 준비되지 않았습니다
          </h2>
          <p className="text-gray-500 mb-6">
            곧 준비될 예정입니다
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-black hover:underline"
          >
            ← 설교 목록으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 헤더 (검정 + 흰글씨) */}
      <header className="bg-black text-white sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="text-gray-300 hover:text-white transition-colors"
              aria-label="뒤로가기"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>

            <div className="text-center flex-1 mx-4">
              <h1 className="text-base font-medium text-white truncate">
                {sermon.title}
              </h1>
              <p className="text-xs text-gray-400">
                {formatDateWithDay(sermon.date)}
              </p>
            </div>

            {/* 저장 상태 표시 */}
            <div className="w-24 text-right">
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

          {/* 진행률 */}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium">
              {currentIndex + 1} / {sections.length}
            </span>
            <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / sections.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* 메인 */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-4">
        {/* 미니맵 */}
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          {sections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                'flex-shrink-0 w-8 h-8 rounded-full text-xs font-medium transition-all border',
                index === currentIndex
                  ? 'bg-black text-white border-black scale-110'
                  : notes[section.id]
                    ? 'bg-gray-200 text-black border-gray-300 hover:bg-gray-300'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
              )}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {/* 구간 카드 */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5 animate-fade-in" key={currentSection.id}>
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-black text-white text-sm font-bold">
                {currentIndex + 1}
              </span>
              <h2 className="text-lg font-semibold text-black">
                {currentSection.title}
              </h2>
            </div>

            {currentSection.key_verses && (
              <p className="text-sm text-gray-700 font-medium mb-2">
                📖 {currentSection.key_verses}
              </p>
            )}

            <p className="text-primary-700 leading-relaxed whitespace-pre-line">
  {currentSection.summary}
</p>
          </div>

          {/* 메모 */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ✍🏻 나의 메모
            </label>

            <textarea
              className="w-full rounded-xl border border-gray-300 bg-white p-4 leading-relaxed focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black"
              placeholder="설교를 들으며 기억하고 싶은 내용들을 적어보세요"
              value={notes[currentSection.id] || ''}
              onChange={(e) => handleNoteChange(currentSection.id, e.target.value)}
              rows={10}
            />

            {!isLoggedIn && (
              <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                로그인하시면 메모가 자동으로 저장됩니다
              </p>
            )}
          </div>
        </div>

        {/* 이전/다음 */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className={cn(
              'flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 border',
              currentIndex === 0
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                : 'bg-white text-black border-gray-300 hover:border-black'
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
              'flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 border',
              currentIndex === sections.length - 1
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                : 'bg-black text-white border-black hover:bg-gray-900'
            )}
          >
            다음
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </main>

      {/* 푸터 */}
      {sermon.preacher && (
        <footer className="border-t border-gray-200 bg-white">
          <div className="max-w-2xl mx-auto px-4 py-3 text-center">
            <p className="text-sm text-gray-600">
              {sermon.preacher} 목사 · {formatDateWithDay(sermon.date)}
            </p>
          </div>
        </footer>
      )}

      {showLoginPrompt && (
        <LoginPrompt onClose={() => setShowLoginPrompt(false)} />
      )}
    </div>
  )
}
