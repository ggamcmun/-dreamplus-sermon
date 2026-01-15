import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import SermonActions from './SermonActions'
import type { Sermon } from '@/types'

export const revalidate = 0

async function getSermons(): Promise<Sermon[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('sermons')
    .select('*')
    .order('date', { ascending: false })

  if (error) {
    console.error('설교 목록 조회 오류:', error)
    return []
  }

  return data || []
}

export default async function SermonsPage() {
  const sermons = await getSermons()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">설교 관리</h1>
        <Link href="/admin/sermons/new" className="admin-btn admin-btn-primary">
          ➕ 새 설교 만들기
        </Link>
      </div>

      {sermons.length === 0 ? (
        <div className="admin-card text-center py-12">
          <div className="text-5xl mb-4">📖</div>
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            아직 등록된 설교가 없습니다
          </h2>
          <p className="text-gray-500 mb-4">
            첫 번째 설교를 만들어보세요
          </p>
          <Link href="/admin/sermons/new" className="admin-btn admin-btn-primary">
            설교 만들기
          </Link>
        </div>
      ) : (
        <div className="admin-card overflow-hidden p-0">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">제목</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 hidden sm:table-cell">날짜</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-gray-500">상태</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sermons.map((sermon) => (
                <tr key={sermon.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <Link 
                        href={`/admin/sermons/${sermon.id}/edit`}
                        className="font-medium text-gray-900 hover:text-church-navy"
                      >
                        {sermon.title}
                      </Link>
                      {sermon.preacher && (
                        <div className="text-sm text-gray-500">{sermon.preacher}</div>
                      )}
                      <div className="text-xs text-gray-400 sm:hidden mt-1">
                        {formatDate(sermon.date)}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 hidden sm:table-cell">
                    {formatDate(sermon.date)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      sermon.is_published 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {sermon.is_published ? '공개' : '비공개'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <SermonActions sermon={sermon} appUrl={appUrl} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
