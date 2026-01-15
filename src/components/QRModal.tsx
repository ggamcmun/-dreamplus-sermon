'use client'

import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'

interface Props {
  url: string
  title: string
  onClose: () => void
}

export default function QRModal({ url, title, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 280,
        margin: 2,
        color: {
          dark: '#2c3e50',
          light: '#ffffff',
        },
      })
    }
  }, [url])

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      alert('URL을 복사할 수 없습니다.')
    }
  }

  const downloadQR = () => {
    if (canvasRef.current) {
      const link = document.createElement('a')
      link.download = `qr-${title.replace(/\s+/g, '-')}.png`
      link.href = canvasRef.current.toDataURL('image/png')
      link.click()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-2xl max-w-sm w-full mx-4 p-6 animate-slide-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
        >
          ✕
        </button>

        <h3 className="text-lg font-semibold text-gray-900 mb-1">QR 코드</h3>
        <p className="text-sm text-gray-500 mb-4">{title}</p>

        <div className="bg-gray-50 rounded-xl p-4 flex justify-center mb-4">
          <canvas ref={canvasRef} />
        </div>

        <div className="flex items-center gap-2 mb-4">
          <input
            type="text"
            value={url}
            readOnly
            className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg"
          />
          <button
            onClick={copyUrl}
            className="px-4 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            {copied ? '복사됨!' : '복사'}
          </button>
        </div>

        <button
          onClick={downloadQR}
          className="w-full admin-btn admin-btn-primary"
        >
          📥 QR 이미지 다운로드
        </button>
      </div>
    </div>
  )
}
