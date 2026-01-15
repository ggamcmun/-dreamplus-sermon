import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/'

  if (code) {
    const supabase = createClient()
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      // 프로필 생성 (없으면)
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single()

      if (!existingProfile) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          role: 'member',
          display_name: data.user.user_metadata.full_name || data.user.email?.split('@')[0],
        })
      }
    }
  }

  // 원래 페이지로 리다이렉트
  return NextResponse.redirect(new URL(next, request.url))
}
