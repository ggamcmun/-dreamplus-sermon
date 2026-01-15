export interface Sermon {
  id: string
  title: string
  date: string
  preacher?: string
  description?: string
  is_published: boolean
  slug: string
  created_at: string
  updated_at: string
}

export interface Section {
  id: string
  sermon_id: string
  order_index: number
  title: string
  summary: string
  key_verses?: string
  created_at: string
}

export interface Note {
  id: string
  section_id: string
  user_id: string
  content: string
  updated_at: string
}

export interface Profile {
  id: string
  role: 'admin' | 'member'
  display_name?: string
  created_at: string
}

export interface SermonWithSections extends Sermon {
  sections: Section[]
}

export interface SectionWithNote extends Section {
  note?: Note
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'
