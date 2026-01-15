import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import SermonForm from '@/components/SermonForm'
import type { Sermon, Section } from '@/types'

interface PageProps {
  params: { id: string }
}

async function getSermonWithSections(id: string): Promise<{
  sermon: Sermon | null
  sections: Section[]
}> {
  const supabase = createClient()

  const { data: sermon, error: sermonError } = await supabase
    .from('sermons')
    .select('*')
    .eq('id', id)
    .single()

  if (sermonError || !sermon) {
    return { sermon: null, sections: [] }
  }

  const { data: sections, error: sectionsError } = await supabase
    .from('sections')
    .select('*')
    .eq('sermon_id', id)
    .order('order_index', { ascending: true })

  if (sectionsError) {
    console.error('구간 조회 오류:', sectionsError)
    return { sermon, sections: [] }
  }

  return { sermon, sections: sections || [] }
}

export default async function EditSermonPage({ params }: PageProps) {
  const { sermon, sections } = await getSermonWithSections(params.id)

  if (!sermon) {
    notFound()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">설교 수정</h1>
      <SermonForm sermon={sermon} sections={sections} />
    </div>
  )
}
