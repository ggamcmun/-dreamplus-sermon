'use client'

import React, { useState } from 'react'

// ✅ 샘플 데이터(디자인 확인용)
const sampleSermon = {
  date: '2026.01.21',
  title: '교회 1 | 교회는 언제 어떻게 시작되었나요',
  preacher: '문현철 목사',
  sections: [
    {
      id: 's1',
      title: '교회는 “예수님으로 시작된 공동체”입니다',
      keyVerses: '마 16:18',
      summary:
        '교회는 건물이 아니라 예수님을 주로 고백하는 사람들의 공동체입니다. 예수님의 약속 위에 세워진 공동체라는 사실을 기억합니다.',
    },
    {
      id: 's2',
      title: '교회는 “성령으로 살아 움직이는 공동체”입니다',
      keyVerses: '행 2:42',
      summary:
        '초대교회는 말씀, 교제, 기도에 힘쓰며 살아있는 공동체로 자랐습니다. 우리도 그 리듬을 다시 회복합니다.',
    },
    {
      id: 's3',
      title: '교회는 “세상 속으로 보내진 공동체”입니다',
      keyVerses: '마 28:19-20',
      summary:
        '교회는 모이는 곳을 넘어 보내심을 받은 공동체입니다. 삶의 자리에서 복음의 향기를 드러내는 교회로 부르심 받았습니다.',
    },
  ],
}

// 드림플러스 브랜드 색상 (검정 테마)
const brand = {
  black: '#000000',
  darkGray: '#1a1a1a',
  gray: '#333333',
  lightGray: '#666666',
  silver: '#999999',
  light: '#f5f5f5',
  white: '#ffffff',
  accent: '#000000',
}

export default function DreamPlusSermonNote() {
  const [currentView, setCurrentView] = useState<'home' | 'sermon' | 'admin'>(
    'home'
  )
  const [currentIndex, setCurrentIndex] = useState(0)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>(
    'idle'
  )
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)

  const currentSection = sampleSermon.sections[currentIndex]

  const handleNoteChange = (sectionId: string, content: string) => {
    if (!isLoggedIn) {
      setShowLoginModal(true)
      return
    }
    setNotes((prev) => ({ ...prev, [sectionId]: content }))
    setSaveStatus('saving')

    setTimeout(() => {
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    }, 800)
  }

  // 홈 화면
  const HomeView = () => (
    <div className="min-h-screen" style={{ backgroundColor: brand.white }}>
      <header style={{ backgroundColor: brand.black }}>
        <div className="max-w-lg mx-auto px-4 py-8 text-center">
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: brand.white }}
          >
            DREAM+
          </h1>
          <p
            className="mt-1 text-sm tracking-widest"
            style={{ color: brand.silver }}
          >
            드림플러스 예배
          </p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        <h2
          className="text-xs font-bold uppercase tracking-widest mb-4"
          style={{ color: brand.silver }}
        >
          이번 주 설교
        </h2>

        <button
          onClick={() => setCurrentView('sermon')}
          className="w-full text-left rounded-2xl p-5 transition-all hover:shadow-lg border-2"
          style={{
            backgroundColor: brand.white,
            borderColor: brand.black,
          }}
        >
          <time className="text-xs font-medium" style={{ color: brand.silver }}>
            {sampleSermon.date}
          </time>
          <h3 className="text-xl font-bold mt-1" style={{ color: brand.black }}>
            {sampleSermon.title}
          </h3>
          <p className="text-sm mt-1" style={{ color: brand.lightGray }}>
            {sampleSermon.preacher}
          </p>
          <div className="flex items-center justify-between mt-4">
            <span
              className="text-xs px-3 py-1 rounded-full font-medium"
              style={{ backgroundColor: brand.black, color: brand.white }}
            >
              {sampleSermon.sections.length}개 구간
            </span>
            <span className="text-lg" style={{ color: brand.black }}>
              →
            </span>
          </div>
        </button>

        <button
          onClick={() => setCurrentView('admin')}
          className="w-full mt-4 py-3 text-sm rounded-xl border-2 border-dashed transition-colors"
          style={{ borderColor: brand.silver, color: brand.lightGray }}
        >
          ⚙️ 관리자 페이지
        </button>
      </main>

      <footer className="mt-auto py-6 text-center">
        <p className="text-xs" style={{ color: brand.silver }}>
          © DREAM+ 드림플러스
        </p>
      </footer>
    </div>
  )

  // 설교노트 라이브 화면
  const SermonView = () => (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: brand.light }}
    >
      <header className="sticky top-0 z-10" style={{ backgroundColor: brand.black }}>
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentView('home')}
              className="p-1 text-white/70 hover:text-white"
            >
              ←
            </button>

            <div className="text-center flex-1 mx-4">
              <p className="text-xs font-bold tracking-widest" style={{ color: brand.silver }}>
                DREAM+
              </p>
              <h1 className="text-sm font-medium truncate text-white">
                {sampleSermon.title}
              </h1>
            </div>

            <div className="w-16 text-right text-xs">
              {saveStatus === 'saving' && (
                <span className="px-2 py-1 rounded-full bg-yellow-400 text-black">
                  저장 중
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="px-2 py-1 rounded-full bg-green-400 text-black">
                  ✓ 저장
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs font-bold" style={{ color: brand.silver }}>
              {currentIndex + 1}/{sampleSermon.sections.length}
            </span>
            <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ backgroundColor: brand.gray }}>
              <div
                className="h-full transition-all duration-300"
                style={{
                  backgroundColor: brand.white,
                  width: `${((currentIndex + 1) / sampleSermon.sections.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-4">
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {sampleSermon.sections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => setCurrentIndex(index)}
              className="flex-shrink-0 w-10 h-10 rounded-full text-sm font-bold transition-all"
              style={{
                backgroundColor:
                  index === currentIndex
                    ? brand.black
                    : notes[section.id]
                    ? brand.gray
                    : brand.white,
                color:
                  index === currentIndex
                    ? brand.white
                    : notes[section.id]
                    ? brand.white
                    : brand.black,
                transform: index === currentIndex ? 'scale(1.15)' : 'scale(1)',
                border: index === currentIndex ? 'none' : `2px solid ${brand.black}`,
              }}
            >
              {index + 1}
            </button>
          ))}
        </div>

        <div
          className="rounded-2xl p-5 shadow-lg"
          style={{ backgroundColor: brand.white, border: `3px solid ${brand.black}` }}
        >
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-3">
              <span
                className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold"
                style={{ backgroundColor: brand.black, color: brand.white }}
              >
                {currentIndex + 1}
              </span>
              <h2 className="text-lg font-bold" style={{ color: brand.black }}>
                {currentSection.title}
              </h2>
            </div>

            {currentSection.keyVerses && (
              <p
                className="text-sm font-bold mb-3 flex items-center gap-2"
                style={{ color: brand.gray }}
              >
                <span>📖</span> {currentSection.keyVerses}
              </p>
            )}

            <p className="leading-relaxed" style={{ color: brand.darkGray }}>
              {currentSection.summary}
            </p>
          </div>

          <div className="mt-5 pt-5" style={{ borderTop: `1px solid ${brand.light}` }}>
            <label className="block text-sm font-bold mb-2" style={{ color: brand.black }}>
              ✍️ 나의 메모
            </label>
            <textarea
              className="w-full p-4 rounded-xl border-2 transition-colors focus:outline-none"
              style={{
                borderColor: brand.black,
                backgroundColor: brand.white,
                minHeight: '120px',
                lineHeight: '1.8',
                fontSize: '16px',
              }}
              placeholder="이 구간에서 느낀 점을 자유롭게 적어보세요..."
              value={notes[currentSection.id] || ''}
              onChange={(e) => handleNoteChange(currentSection.id, e.target.value)}
              onFocus={() => !isLoggedIn && setShowLoginModal(true)}
            />

            {!isLoggedIn && (
              <p className="mt-2 text-xs flex items-center gap-1" style={{ color: brand.silver }}>
                ℹ️ 로그인하시면 메모가 자동으로 저장됩니다
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={() => currentIndex > 0 && setCurrentIndex(currentIndex - 1)}
            disabled={currentIndex === 0}
            className="flex-1 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border-2"
            style={{
              backgroundColor: currentIndex === 0 ? brand.light : brand.white,
              borderColor: currentIndex === 0 ? brand.light : brand.black,
              color: currentIndex === 0 ? brand.silver : brand.black,
              cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            ← 이전
          </button>

          <button
            onClick={() =>
              currentIndex < sampleSermon.sections.length - 1 &&
              setCurrentIndex(currentIndex + 1)
            }
            disabled={currentIndex === sampleSermon.sections.length - 1}
            className="flex-1 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
            style={{
              backgroundColor:
                currentIndex === sampleSermon.sections.length - 1
                  ? brand.light
                  : brand.black,
              color:
                currentIndex === sampleSermon.sections.length - 1
                  ? brand.silver
                  : brand.white,
              cursor:
                currentIndex === sampleSermon.sections.length - 1
                  ? 'not-allowed'
                  : 'pointer',
            }}
          >
            다음 →
          </button>
        </div>
      </main>

      <footer style={{ backgroundColor: brand.black }}>
        <div className="max-w-lg mx-auto px-4 py-3 text-center">
          <p className="text-sm" style={{ color: brand.silver }}>
            {sampleSermon.preacher} · {sampleSermon.date}
          </p>
        </div>
      </footer>

      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowLoginModal(false)} />
          <div className="relative rounded-t-3xl w-full max-w-md p-6" style={{ backgroundColor: brand.white }}>
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full"
              style={{ backgroundColor: brand.light, color: brand.gray }}
            >
              ✕
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: brand.black }}>
                <span className="text-2xl">📝</span>
              </div>
              <h2 className="text-xl font-bold" style={{ color: brand.black }}>
                로그인이 필요해요
              </h2>
              <p className="mt-2" style={{ color: brand.lightGray }}>
                메모는 로그인 후 안전하게 저장됩니다 🙂
                <br />
                <span className="text-sm" style={{ color: brand.silver }}>
                  다른 기기에서도 내 메모를 볼 수 있어요
                </span>
              </p>
            </div>

            <button
              onClick={() => {
                setIsLoggedIn(true)
                setShowLoginModal(false)
              }}
              className="w-full flex items-center justify-center gap-3 py-4 px-4 rounded-xl font-bold transition-all"
              style={{ backgroundColor: brand.black, color: brand.white }}
            >
              Google로 로그인
            </button>

            <p className="mt-4 text-center text-xs" style={{ color: brand.silver }}>
              로그인 없이도 설교 내용은 계속 볼 수 있어요
            </p>
          </div>
        </div>
      )}
    </div>
  )

  // 관리자 화면(디자인용)
  const AdminView = () => (
    <div className="min-h-screen" style={{ backgroundColor: brand.light }}>
      <header style={{ backgroundColor: brand.black }}>
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-4">
              <button onClick={() => setCurrentView('home')} className="text-white/70 hover:text-white">
                ←
              </button>
              <span className="font-bold">DREAM+ 관리</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl p-4" style={{ backgroundColor: brand.white }}>
            <div className="text-2xl font-bold" style={{ color: brand.black }}>
              1
            </div>
            <div className="text-sm" style={{ color: brand.silver }}>
              전체 설교
            </div>
          </div>
          <div className="rounded-xl p-4" style={{ backgroundColor: brand.white }}>
            <div className="text-2xl font-bold" style={{ color: brand.black }}>
              1
            </div>
            <div className="text-sm" style={{ color: brand.silver }}>
              공개됨
            </div>
          </div>
          <div className="rounded-xl p-4" style={{ backgroundColor: brand.white }}>
            <div className="text-2xl font-bold" style={{ color: brand.black }}>
              {Object.keys(notes).filter((k) => notes[k]).length}
            </div>
            <div className="text-sm" style={{ color: brand.silver }}>
              메모
            </div>
          </div>
        </div>
      </main>
    </div>
  )

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {currentView === 'home' && <HomeView />}
      {currentView === 'sermon' && <SermonView />}
      {currentView === 'admin' && <AdminView />}
    </div>
  )
}
