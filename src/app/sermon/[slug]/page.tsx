export const dynamic = 'force-dynamic'
export const revalidate = 0

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import SermonNoteClient from './SermonNoteClient'
import type { Sermon, Section, Note } from '@/types'

export const revalidate = 0

interface PageProps {
  params: { slug: string }
}

async function getSermonBySlug(slug: string): Promise<{
  sermon: Sermon | null
  sections: Section[]
  notes: Note[]
  userId: string | null
}> {
  const supabase = createClient()
  
  // 현재 사용자 확인
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id || null

  // 설교 조회
  const { data: sermon, error: sermonError } = await supabase
    .from('sermons')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (sermonError || !sermon) {
    return { sermon: null, sections: [], notes: [], userId }
  }

  // 구간 조회
  const { data: sections, error: sectionsError } = await supabase
    .from('sections')
    .select('*')
    .eq('sermon_id', sermon.id)
    .order('order_index', { ascending: true })

  if (sectionsError) {
    console.error('구간 조회 오류:', sectionsError)
    return { sermon, sections: [], notes: [], userId }
  }

  // 사용자의 메모 조회 (로그인한 경우만)
  let notes: Note[] = []
  if (userId && sections && sections.length > 0) {
    const sectionIds = sections.map(s => s.id)
    const { data: notesData, error: notesError } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .in('section_id', sectionIds)

    if (!notesError && notesData) {
      notes = notesData
    }
  }

  return {
    sermon,
    sections: sections || [],
    notes,
    userId
  }
}

export async function generateMetadata({ params }: PageProps) {
  const supabase = createClient()
  const { data: sermon } = await supabase
    .from('sermons')
    .select('title, date, preacher')
    .eq('slug', params.slug)
    .single()

  if (!sermon) {
    return { title: '설교를 찾을 수 없습니다' }
  }

  return {
    title: `${sermon.title} | 설교노트`,
    description: `${sermon.date} ${sermon.preacher || ''} 설교`,
  }
}

export default async function SermonPage({ params }: PageProps) {
  const { sermon, sections, notes, userId } = await getSermonBySlug(params.slug)

  if (!sermon) {
    notFound()
  }

  return (
    <SermonNoteClient
      sermon={sermon}
      sections={sections}
      initialNotes={notes}
      userId={userId}
    />
  )
}
