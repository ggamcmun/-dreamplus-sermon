'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { generateSlug, cn } from '@/lib/utils'
import type { Sermon, Section } from '@/types'

interface SectionInput {
  id?: string
  title: string
  summary: string
  key_verses: string
  isNew?: boolean
  isDeleted?: boolean
}

interface Props {
  sermon?: Sermon
  sections?: Section[]
}

export default function SermonForm({ sermon, sections = [] }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const isEdit = !!sermon

  const [title, setTitle] = useState(sermon?.title || '')
  const [date, setDate] = useState(sermon?.date || new Date().toISOString().split('T')[0])
  const [preacher, setPreacher] = useState(sermon?.preacher || '')
  const [description, setDescription] = useState(sermon?.description || '')
  const [isPublished, setIsPublished] = useState(sermon?.is_published ?? false)

  const [sectionInputs, setSectionInputs] = useState<SectionInput[]>(
    sections.length > 0
      ? sections.map(s => ({
          id: s.id,
          title: s.title,
          summary: s.summary,
          key_verses: s.key_verses || '',
        }))
      : [{ title: '', summary: '', key_verses: '', isNew: true }]
  )

  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const addSection = () => {
    setSectionInputs([
      ...sectionInputs,
      { title: '', summary: '', key_verses: '', isNew: true }
    ])
  }

  const removeSection = (index: number) => {
    if (sectionInputs.filter(s => !s.isDeleted).length <= 1) {
      alert('최소 1개의 구간이 필요합니다.')
      return
    }

    const section = sectionInputs[index]
    if (section.id) {
      setSectionInputs(
        sectionInputs.map((s, i) => 
          i === index ? { ...s, isDeleted: true } : s
        )
      )
    } else {
      setSectionInputs(sectionInputs.filter((_, i) => i !== index))
    }
  }

  const updateSection = (index: number, field: keyof SectionInput, value: string) => {
    setSectionInputs(
      sectionInputs.map((s, i) => 
        i === index ? { ...s, [field]: value } : s
      )
    )
  }

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const activeIndexes = sectionInputs
      .map((s, i) => (!s.isDeleted ? i : -1))
      .filter(i => i !== -1)
    
    const currentActiveIndex = activeIndexes.indexOf(index)
    const newActiveIndex = direction === 'up' ? currentActiveIndex - 1 : currentActiveIndex + 1
    
    if (newActiveIndex < 0 || newActiveIndex >= activeIndexes.length) return

    const newIndex = activeIndexes[newActiveIndex]
    const newSections = [...sectionInputs]
    const temp = newSections[index]
    newSections[index] = newSections[newIndex]
    newSections[newIndex] = temp
    setSectionInputs(newSections)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSaving(true)

    try {
      if (!title.trim()) {
        throw new Error('설교 제목을 입력해주세요.')
      }

      const activeSections = sectionInputs.filter(s => !s.isDeleted)
      if (activeSections.length === 0) {
        throw new Error('최소 1개의 구간이 필요합니다.')
      }

      const emptySections = activeSections.filter(s => !s.title.trim() || !s.summary.trim())
      if (emptySections.length > 0) {
        throw new Error('모든 구간의 제목과 내용을 입력해주세요.')
      }

      const slug = isEdit ? sermon.slug : generateSlug(title, date)

      if (isEdit) {
        const { error: sermonError } = await supabase
          .from('sermons')
          .update({
            title,
            date,
            preacher: preacher || null,
            description: description || null,
            is_published: isPublished,
            updated_at: new Date().toISOString(),
          })
          .eq('id', sermon.id)

        if (sermonError) throw sermonError

        const deletedSections = sectionInputs.filter(s => s.isDeleted && s.id)
        for (const section of deletedSections) {
          await supabase.from('sections').delete().eq('id', section.id)
        }

        let orderIndex = 0
        for (const section of activeSections) {
          if (section.id) {
            await supabase
              .from('sections')
              .update({
                title: section.title,
                summary: section.summary,
                key_verses: section.key_verses || null,
                order_index: orderIndex,
              })
              .eq('id', section.id)
          } else {
            await supabase.from('sections').insert({
              sermon_id: sermon.id,
              title: section.title,
              summary: section.summary,
              key_verses: section.key_verses || null,
              order_index: orderIndex,
            })
          }
          orderIndex++
        }
      } else {
        const { data: newSermon, error: sermonError } = await supabase
          .from('sermons')
          .insert({
            title,
            date,
            preacher: preacher || null,
            description: description || null,
            is_published: isPublished,
            slug,
          })
          .select()
          .single()

        if (sermonError) throw sermonError

        const sectionsToInsert = activeSections.map((section, index) => ({
          sermon_id: newSermon.id,
          title: section.title,
          summary: section.summary,
          key_verses: section.key_verses || null,
          order_index: index,
        }))

        const { error: sectionsError } = await supabase
          .from('sections')
          .insert(sectionsToInsert)

        if (sectionsError) throw sectionsError
      }

      router.push('/admin/sermons')
      router.refresh()
    } catch (err) {
      console.error('저장 오류:', err)
      setError(err instanceof Error ? err.message : '저장에 실패했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  const activeSections = sectionInputs.filter(s => !s.isDeleted)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="admin-card space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">설교 정보</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              설교 제목 *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 믿음의 사람들"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-church-navy focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              날짜 *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-church-navy focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              설교자
            </label>
            <input
              type="text"
              value={preacher}
              onChange={(e) => setPreacher(e.target.value)}
              placeholder="예: 홍길동"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-church-navy focus:border-transparent"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              설교 설명 (선택)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="설교에 대한 간단한 소개"
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-church-navy focus:border-transparent resize-none"
            />
          </div>

          <div className="sm:col-span-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPublished(!isPublished)}
              className={`toggle-switch ${isPublished ? 'active' : ''}`}
            />
            <span className="text-sm text-gray-700">
              {isPublished ? '공개됨 - 성도들이 볼 수 있습니다' : '비공개 - 아직 성도들에게 보이지 않습니다'}
            </span>
          </div>
        </div>
      </div>

      <div className="admin-card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            설교 구간 ({activeSections.length}개)
          </h2>
          <button
            type="button"
            onClick={addSection}
            className="admin-btn admin-btn-secondary text-sm"
          >
            ➕ 구간 추가
          </button>
        </div>

        <div className="space-y-4">
          {sectionInputs.map((section, index) => {
            if (section.isDeleted) return null
            
            const activeIndex = sectionInputs
              .slice(0, index + 1)
              .filter(s => !s.isDeleted).length

            return (
              <div
                key={index}
                className="border border-gray-200 rounded-xl p-4 bg-gray-50"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-church-navy text-white text-sm font-bold">
                    {activeIndex}
                  </span>
                  
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveSection(index, 'up')}
                      disabled={activeIndex === 1}
                      className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSection(index, 'down')}
                      disabled={activeIndex === activeSections.length}
                      className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSection(index)}
                      className="p-1.5 text-red-400 hover:text-red-600"
                    >
                      🗑
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => updateSection(index, 'title', e.target.value)}
                    placeholder="구간 제목 (예: 1. 믿음이란 무엇인가)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-church-navy focus:border-transparent"
                  />
                  
                  <input
                    type="text"
                    value={section.key_verses}
                    onChange={(e) => updateSection(index, 'key_verses', e.target.value)}
                    placeholder="핵심 성경구절 (예: 히브리서 11:1)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-church-navy focus:border-transparent"
                  />
                  
                  <textarea
                    value={section.summary}
                    onChange={(e) => updateSection(index, 'summary', e.target.value)}
                    placeholder="구간 내용 요약"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-church-navy focus:border-transparent resize-none"
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="admin-btn admin-btn-secondary"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="admin-btn admin-btn-primary"
        >
          {isSaving ? '저장 중...' : isEdit ? '수정 완료' : '설교 만들기'}
        </button>
      </div>
    </form>
  )
}
