'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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

export default function SermonNoteClient({
  sermon,
  sections,
  initialNotes,
  userId,
}: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(!!userId)

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  /* ===============================
     초기 노트 로딩
  ================================ */
  useEffect(() => {
    const map: Record<string, string> = {}
    initialNotes.forEach((n) => {
      map[n.section_id] = n.content
    })
    setNotes(map)
  }, [initialNotes])

  /* ===============================
     로그인 상태 변화 감지
  ================================ */
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_, session) => {
      setIsLoggedIn(!!session?.user)
      if (session?.user) {
        await loadUserNotes(session.user.id)
      }
    })

    return () => subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadUserNotes = async (uid: string) => {
    const ids = sections.map((s) => s.id)
    const { data } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', uid)
      .in('section_id', ids)

    if (data) {
      const map: Record<string, string> = {}
      data.forEach((n) => (map[n.section_id] = n.content))
      setNotes(map)
    }
  }

  /* ===============================
     저장 로직
  ================================ */
  const saveNote = useCallback(
    async (sectionId: string, content: string) => {
      if (!isLoggedIn) {
        setShowLoginPrompt(true)
        return false
      }

      setSaveStatus('saving')

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setSaveStatus('error')
        return false
      }

      const { error } = await supabase.from('notes').upsert(
        {
          section_id: sectionId,
          user_id: user.id,
          content,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'section_id,user_id' }
      )

      if (error) {
        console.error(error)
        setSaveStatus('error')
        return false
      }

      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
      return true
    },
    [isLoggedIn, supabase]
  )

  const handleChange = (sectionId: string, value: string) => {
    setNotes((prev) => ({ ...prev, [sectionId]: value }))

    if (!isLoggedIn) {
      setShowLoginPrompt(true)
      return
    }

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)

    saveTimeoutRef.current = setTimeout(() => {
      saveNote(sectionId, value)
    }, 800)
  }

  /* ===============================
     완료하기 버튼
  ================================ */
  const handleComplete = async () => {
    const section = sections[currentIndex]
    const content = notes[section.id] || ''

    const ok = await saveNote(section.id, content)

    if (ok) {
      alert('메모가 저장되었습니다.')
      router.push('/')
    } else {
      alert('저장에 실패했습니다. 다시 시도해 주세요.')
    }
  }

  const currentSection = sections[currentIndex]
  if (!currentSection) return null

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ===============================
          헤더
      ================================ */}
      <header className="bg-black text-white sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 relative flex items-center">
          {/* 왼쪽 */}
          <Link
            href="/"
            className="text-gray-300 hover:text-white transition-colors z-10"
          >
            ←
          </Link>

          {/* 가운데 제목 */}
          <div className="absolute left-1/2 -translate-x-1/2 text-center w-[72%]">
            <h1 className="text-sm font-medium leading-snug whitespace-normal break-words">
              {sermon.title}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {formatDateWithDay(sermon.date)}
            </p>
          </div>

          {/* 오른쪽 저장 상태 */}
          <div className="ml-auto text-xs w-20 text-right z-10">
            {saveStatus === 'saving' && '저장 중'}
            {saveStatus === 'saved' && '✓ 저장됨'}
            {saveStatus === 'error' && '⚠ 오류'}
          </div>
        </div>
      </header>

      {/* ===============================
          본문
      ================================ */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-4">
        <div className="border rounded-xl p-5 mb-4 space-y-4">
          {/* 구간 제목 */}
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-black text-white text-sm font-bold flex items-center justify-center">
              {currentIndex + 1}
            </span>
            <h2 className="font-semibold text-black">
              {currentSection.title}
            </h2>
          </div>

          {/* 성경 본문 */}
          {currentSection.key_verses && (
            <div className="bg-gray-50 rounded-lg px-3 py-2 text-sm font-medium text-gray-800">
              📖 {currentSection.key_verses}
            </div>
          )}

          {/* 요약 */}
          {currentSection.summary && (
            <p className="text-sm text-gray-700 whitespace-pre-line">
              {currentSection.summary}
            </p>
          )}

          {/* 메모 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ✍🏻 나의 메모
            </label>
            <textarea
              className="w-full border rounded-lg p-3 leading-relaxed focus:outline-none focus:ring-2 focus:ring-black/20"
              rows={10}
              placeholder="설교를 들으며 메모해 보세요"
              value={notes[currentSection.id] || ''}
              onChange={(e) =>
                handleChange(currentSection.id, e.target.value)
              }
            />
          </div>
        </div>

        {/* 완료 버튼 */}
        <button
          onClick={handleComplete}
          className="w-full bg-black text-white py-3 rounded-xl font-medium"
        >
          완료하기
        </button>
      </main>

      {showLoginPrompt && (
        <LoginPrompt onClose={() => setShowLoginPrompt(false)} />
      )}
    </div>
  )
}
