import { format, parseISO } from 'date-fns'
import { ko } from 'date-fns/locale'

export function formatDate(dateString: string, formatStr: string = 'yyyy년 M월 d일'): string {
  try {
    const date = parseISO(dateString)
    return format(date, formatStr, { locale: ko })
  } catch {
    return dateString
  }
}

export function formatDateWithDay(dateString: string): string {
  try {
    const date = parseISO(dateString)
    return format(date, 'yyyy년 M월 d일 (EEEE)', { locale: ko })
  } catch {
    return dateString
  }
}

export function generateSlug(title: string, date: string): string {
  const dateStr = date.replace(/-/g, '')
  const titleSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 30)
  return `${dateStr}-${titleSlug || 'sermon'}`
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function executedFunction(...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
