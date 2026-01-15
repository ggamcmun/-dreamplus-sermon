'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Sermon } from '@/types'
import QRModal from '@/components/QRModal'

interface Props {
  sermon: Sermon
  appUrl: string
}

export default function SermonActions({ sermon, appUrl }: Props) {
  const [showQR, setShowQR] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const togglePublish = async () => {
    setIsUpdating(true)
    
    const { error } = await supabase
      .from('sermons')
      .update({ is_published: !sermon.is_published })
      .eq('id', sermon.id)

    if (error) {
      alert('상태 변경에 실패했습니다.')
    } else {
      router.refresh()
    }
    
    setIsUpdating(false)
  }

  const deleteSermon = async () => {
    if (!confirm('이 설교를 삭제하시겠습니까?\n연결된 구간과 메모도 모두 삭제됩니다.')) {
      return
    }

    const { error } = await supabase
      .from('sermons')
      .delete()
      .eq('id', sermon.id)

    if (error) {
      alert('삭제에 실패했습니다.')
    } else {
      router.refresh()
    }
  }

  const sermonUrl = `${appUrl}/sermon/${sermon.slug}`

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={() => setShowQR(true)}
        className="p-2 text-gray-400 hover:text-church-navy transition-colors"
        title="QR 코드"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
      </button>

      <button
        onClick={togglePublish}
        disabled={isUpdating}
        className={`toggle-switch ${sermon.is_published ? 'active' : ''}`}
        title={sermon.is_published ? '비공개로 전환' : '공개로 전환'}
      />

      <Link
        href={`/admin/sermons/${sermon.id}/edit`}
        className="p-2 text-gray-400 hover:text-church-navy transition-colors"
        title="수정"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </Link>

      <button
        onClick={deleteSermon}
        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
        title="삭제"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>

      {showQR && (
        <QRModal 
          url={sermonUrl} 
          title={sermon.title}
          onClose={() => setShowQR(false)} 
        />
      )}
    </div>
  )
}
