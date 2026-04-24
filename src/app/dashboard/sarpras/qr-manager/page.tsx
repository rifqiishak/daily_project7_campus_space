'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import QRCode from 'qrcode'
import { generateRoomsPDF } from '@/services/pdfService'

type Room = {
  id: string
  name: string
  building: string
  qr_code_token: string
}

export default function RoomQRManager() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [isPrinting, setIsPrinting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    const { data } = await supabase.from('rooms').select('*').eq('is_active', true)
    if (data) setRooms(data)
    setLoading(false)
  }

  const downloadQR = async (token: string, roomName: string) => {
    try {
      // 1. Generate QR Code sebagai Data URL (High Quality)
      const qrDataUrl = await QRCode.toDataURL(token, {
        width: 1000,
        margin: 2,
        color: {
          dark: '#1e293b', // Warna Slate-800
          light: '#ffffff',
        },
      })

      // 2. Buat elemen link tersembunyi untuk memicu unduhan
      const link = document.createElement('a')
      link.href = qrDataUrl
      link.download = `QR_CampusSpace_${roomName.replace(/\s+/g, '_')}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error('Gagal membuat QR:', err)
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manajemen QR Ruangan</h1>
          <p className="text-gray-500">Generate dan unduh kode QR untuk akses check-in mahasiswa.</p>
        </div>
        {rooms.length > 0 && (
          <button
            onClick={async () => {
              setIsPrinting(true)
              await generateRoomsPDF(rooms)
              setIsPrinting(false)
            }}
            disabled={isPrinting}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            {isPrinting ? 'Membuat PDF...' : 'Cetak Semua (PDF)'}
          </button>
        )}
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => <div key={i} className="h-40 bg-gray-100 rounded-xl"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <div key={room.id} className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-800">{room.name}</h3>
                <p className="text-sm text-gray-500">{room.building}</p>
              </div>
              
              <div className="flex flex-col gap-3">
                <div className="bg-gray-50 p-2 rounded-lg text-[10px] font-mono text-gray-400 break-all border border-gray-100">
                  Token: {room.qr_code_token}
                </div>
                
                <button
                  onClick={() => downloadQR(room.qr_code_token, room.name)}
                  className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-medium py-2.5 rounded-xl transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Unduh PNG
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
