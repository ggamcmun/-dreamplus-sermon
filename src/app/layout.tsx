import localFont from 'next/font/local'
import type { Metadata, Viewport } from 'next'
import './globals.css'

/* ===============================
   메타데이터
================================ */
export const metadata: Metadata = {
  title: 'DREAMPLUS',
  description: '드림플러스 설교노트',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'DREAMPLUS',
  },
}

/* ===============================
   뷰포트
================================ */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#fdfbf7',
}

/* ===============================
   Pretendard 폰트
================================ */
const pretendard = localFont({
  src: [
    {
      path: './fonts/Pretendard-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/Pretendard-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: './fonts/Pretendard-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
})

/* ===============================
   Root Layout
================================ */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className={`${pretendard.className} min-h-screen bg-church-cream`}>
        {children}
      </body>
    </html>
  )
}
